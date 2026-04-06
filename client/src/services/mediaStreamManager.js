/**
 * Media Stream Manager Service
 * Handles multi-camera, audio, and simultaneous stream management
 * Supports front/rear camera switching and concurrent recording
 */

export const CAMERA_FACING = {
  USER: "user", // Front camera
  ENVIRONMENT: "environment", // Rear camera
  ALL: "all", // Concurrent recording
};

export const MEDIA_CONSTRAINTS = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,
  },
  videoHigh: {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    frameRate: { ideal: 30 },
  },
  videoMedium: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 24 },
  },
  videoLow: {
    width: { ideal: 640 },
    height: { ideal: 480 },
    frameRate: { ideal: 15 },
  },
};

export const STREAM_STATUS = {
  INITIALIZED: "initialized",
  ACTIVE: "active",
  PAUSED: "paused",
  ERROR: "error",
  STOPPED: "stopped",
};

/**
 * Media Stream Manager - Handles all media stream orchestration
 */
class MediaStreamManager {
  constructor() {
    this.streams = new Map(); // Map<streamId, StreamData>
    this.devices = new Map(); // Map<deviceId, DeviceInfo>
    this.status = new Map(); // Map<streamId, Status>
    this.constraints = MEDIA_CONSTRAINTS;
    this.errorHandlers = [];
    this.statusHandlers = [];
    this.browserCapabilities = null;
    this.initialized = false;
  }

  /**
   * Initialize browser capabilities and enumerate devices
   */
  async initialize() {
    try {
      // Check browser capabilities
      this.browserCapabilities = this.detectBrowserCapabilities();

      // Request permission to enumerate devices
      if (navigator.mediaDevices?.enumerateDevices) {
        await this.enumerateDevices();
      }

      this.initialized = true;
      return {
        success: true,
        capabilities: this.browserCapabilities,
        devices: Array.from(this.devices.values()),
      };
    } catch (error) {
      this._notifyError("Initialization failed", error);
      throw error;
    }
  }

  /**
   * Detect browser capabilities
   */
  detectBrowserCapabilities() {
    const ua = navigator.userAgent.toLowerCase();
    const capabilities = {
      browser: "unknown",
      supportsWebCodecs: !!window.VideoEncoder,
      supportsWebRTC: !!navigator.mediaDevices,
      supportsWebWorkers: !!window.Worker,
      supportsServiceWorkers: !!navigator.serviceWorker,
      supportsIndexedDB: !!window.indexedDB,
      supportsVideoTracks: !!navigator.mediaDevices?.getUserMedia,
      supportsAudioWorklet: !!window.AudioContext,
      maxVideoStreams: 3,
      maxAudioStreams: 2,
    };

    // Detect browser type
    if (ua.includes("firefox")) {
      capabilities.browser = "firefox";
      capabilities.maxVideoStreams = 2;
    } else if (ua.includes("chrome") || ua.includes("chromium")) {
      capabilities.browser = "chrome";
      capabilities.maxVideoStreams = 3;
    } else if (ua.includes("safari")) {
      capabilities.browser = "safari";
      capabilities.maxVideoStreams = 1;
      capabilities.supportsWebCodecs = false;
    } else if (ua.includes("edg")) {
      capabilities.browser = "edge";
      capabilities.maxVideoStreams = 3;
    }

    return capabilities;
  }

  /**
   * Enumerate and store device list
   */
  async enumerateDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.devices.clear();

      devices.forEach((device) => {
        this.devices.set(device.deviceId, {
          deviceId: device.deviceId,
          label: device.label || `${device.kind} ${this.devices.size}`,
          kind: device.kind,
          groupId: device.groupId,
        });
      });

      // Listen for device changes
      if (navigator.mediaDevices.ondevicechange === null) {
        navigator.mediaDevices.ondevicechange = () => {
          this.enumerateDevices();
        };
      }
    } catch (error) {
      console.warn("Failed to enumerate devices:", error);
    }
  }

  /**
   * Get available cameras with facing preference
   */
  getAvailableCameras(facing = CAMERA_FACING.USER) {
    const videoDevices = Array.from(this.devices.values()).filter(
      (d) => d.kind === "videoinput"
    );

    if (facing === CAMERA_FACING.ALL) {
      return videoDevices;
    }

    // Sort by facing preference
    return videoDevices.sort((a, b) => {
      const aIsFacing =
        (a.label.toLowerCase().includes("front") &&
          facing === CAMERA_FACING.USER) ||
        (a.label.toLowerCase().includes("back") &&
          facing === CAMERA_FACING.ENVIRONMENT);
      const bIsFacing =
        (b.label.toLowerCase().includes("front") &&
          facing === CAMERA_FACING.USER) ||
        (b.label.toLowerCase().includes("back") &&
          facing === CAMERA_FACING.ENVIRONMENT);

      return aIsFacing ? -1 : bIsFacing ? 1 : 0;
    });
  }

  /**
   * Request media stream with smart constraint handling
   */
  async requestStream(streamId, options = {}) {
    try {
      const {
        audio = true,
        video = true,
        facing = CAMERA_FACING.USER,
        quality = "medium",
        deviceId = null,
      } = options;

      // Build constraints
      let constraints = {};

      if (audio) {
        constraints.audio = this.constraints.audio;
      }

      if (video) {
        let videoQuality = this.constraints.videoMedium;
        if (quality === "high") {
          videoQuality = this.constraints.videoHigh;
        } else if (quality === "low") {
          videoQuality = this.constraints.videoLow;
        }

        // Add facing and device preferences
        constraints.video = {
          ...videoQuality,
          facingMode: { ideal: facing },
        };

        if (deviceId) {
          constraints.video.deviceId = { exact: deviceId };
        }
      }

      // Request stream with fallback strategy
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error) {
        // Fallback: remove device constraint
        if (constraints.video?.deviceId) {
          delete constraints.video.deviceId;
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } else {
          throw error;
        }
      }

      // Store stream data
      const streamData = {
        id: streamId,
        stream,
        tracks: {
          audio: stream.getAudioTracks(),
          video: stream.getVideoTracks(),
        },
        status: STREAM_STATUS.ACTIVE,
        createdAt: new Date(),
        constraints,
        quality,
        facing,
      };

      this.streams.set(streamId, streamData);
      this.status.set(streamId, STREAM_STATUS.ACTIVE);
      this._notifyStatus(streamId, STREAM_STATUS.ACTIVE);

      // Monitor track state changes
      this._monitorTracks(streamId);

      return streamData;
    } catch (error) {
      this._notifyError(`Failed to request stream ${streamId}`, error);
      this.status.set(streamId, STREAM_STATUS.ERROR);
      throw error;
    }
  }

  /**
   * Get all camera devices with concurrent recording support
   */
  async requestConcurrentCameras() {
    try {
      const frontCamera = this.getAvailableCameras(CAMERA_FACING.USER)[0];
      const rearCamera = this.getAvailableCameras(CAMERA_FACING.ENVIRONMENT)[0];

      const streams = [];

      // Front camera
      if (frontCamera) {
        const stream = await this.requestStream(`camera-front-${Date.now()}`, {
          audio: true,
          video: true,
          deviceId: frontCamera.deviceId,
          facing: CAMERA_FACING.USER,
        });
        streams.push(stream);
      }

      // Rear camera (if different)
      if (
        rearCamera &&
        rearCamera.deviceId !== frontCamera?.deviceId
      ) {
        const stream = await this.requestStream(`camera-rear-${Date.now()}`, {
          audio: false, // Only one audio stream
          video: true,
          deviceId: rearCamera.deviceId,
          facing: CAMERA_FACING.ENVIRONMENT,
        });
        streams.push(stream);
      }

      return streams;
    } catch (error) {
      this._notifyError("Failed to request concurrent cameras", error);
      throw error;
    }
  }

  /**
   * Switch camera mid-stream
   */
  async switchCamera(streamId, newFacing = CAMERA_FACING.ENVIRONMENT) {
    try {
      const streamData = this.streams.get(streamId);
      if (!streamData) {
        throw new Error(`Stream ${streamId} not found`);
      }

      // Stop video tracks
      streamData.tracks.video.forEach((track) => track.stop());

      // Request new stream
      const cameras = this.getAvailableCameras(newFacing);
      if (cameras.length === 0) {
        throw new Error(`No ${newFacing} camera available`);
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          ...this.constraints.videoMedium,
          facingMode: { ideal: newFacing },
          deviceId: { ideal: cameras[0].deviceId },
        },
        audio: false, // Keep existing audio
      });

      // Replace video tracks
      const newVideoTracks = newStream.getVideoTracks();
      newVideoTracks.forEach((track) => {
        streamData.stream.addTrack(track);
      });

      streamData.tracks.video = newVideoTracks;
      streamData.facing = newFacing;

      this._notifyStatus(streamId, STREAM_STATUS.ACTIVE);
      return streamData;
    } catch (error) {
      this._notifyError(`Failed to switch camera for ${streamId}`, error);
      throw error;
    }
  }

  /**
   * Pause stream tracks
   */
  async pauseStream(streamId) {
    try {
      const streamData = this.streams.get(streamId);
      if (!streamData) {
        throw new Error(`Stream ${streamId} not found`);
      }

      streamData.stream.getTracks().forEach((track) => {
        track.enabled = false;
      });

      this.status.set(streamId, STREAM_STATUS.PAUSED);
      this._notifyStatus(streamId, STREAM_STATUS.PAUSED);
    } catch (error) {
      this._notifyError(`Failed to pause stream ${streamId}`, error);
      throw error;
    }
  }

  /**
   * Resume stream tracks
   */
  async resumeStream(streamId) {
    try {
      const streamData = this.streams.get(streamId);
      if (!streamData) {
        throw new Error(`Stream ${streamId} not found`);
      }

      streamData.stream.getTracks().forEach((track) => {
        track.enabled = true;
      });

      this.status.set(streamId, STREAM_STATUS.ACTIVE);
      this._notifyStatus(streamId, STREAM_STATUS.ACTIVE);
    } catch (error) {
      this._notifyError(`Failed to resume stream ${streamId}`, error);
      throw error;
    }
  }

  /**
   * Stop and cleanup stream
   */
  async stopStream(streamId) {
    try {
      const streamData = this.streams.get(streamId);
      if (!streamData) {
        return;
      }

      streamData.stream.getTracks().forEach((track) => {
        track.stop();
      });

      this.streams.delete(streamId);
      this.status.set(streamId, STREAM_STATUS.STOPPED);
      this._notifyStatus(streamId, STREAM_STATUS.STOPPED);
    } catch (error) {
      this._notifyError(`Failed to stop stream ${streamId}`, error);
      throw error;
    }
  }

  /**
   * Stop all streams
   */
  async stopAllStreams() {
    const streamIds = Array.from(this.streams.keys());
    for (const streamId of streamIds) {
      await this.stopStream(streamId);
    }
  }

  /**
   * Get stream by ID
   */
  getStream(streamId) {
    return this.streams.get(streamId);
  }

  /**
   * Get all active streams
   */
  getAllStreams() {
    return Array.from(this.streams.values()).filter(
      (s) => s.status === STREAM_STATUS.ACTIVE
    );
  }

  /**
   * Monitor track state changes
   */
  _monitorTracks(streamId) {
    const streamData = this.streams.get(streamId);
    if (!streamData) return;

    const checkTracks = () => {
      const audioTracks = streamData.stream.getAudioTracks();
      const videoTracks = streamData.stream.getVideoTracks();

      // Check if any track ended
      if (
        audioTracks.length === 0 &&
        videoTracks.length === 0
      ) {
        this.status.set(streamId, STREAM_STATUS.STOPPED);
        this._notifyStatus(streamId, STREAM_STATUS.STOPPED);
        return;
      }

      // Check track enabled state
      const allEnabled = [...audioTracks, ...videoTracks].every(
        (t) => t.enabled
      );
      if (allEnabled && this.status.get(streamId) === STREAM_STATUS.PAUSED) {
        this.status.set(streamId, STREAM_STATUS.ACTIVE);
        this._notifyStatus(streamId, STREAM_STATUS.ACTIVE);
      }

      // Continue monitoring
      setTimeout(checkTracks, 2000);
    };

    checkTracks();
  }

  /**
   * Register error handler
   */
  onError(handler) {
    this.errorHandlers.push(handler);
  }

  /**
   * Register status change handler
   */
  onStatusChange(handler) {
    this.statusHandlers.push(handler);
  }

  /**
   * Notify error handlers
   */
  _notifyError(message, error) {
    console.error(message, error);
    this.errorHandlers.forEach((handler) => {
      try {
        handler({ message, error, timestamp: new Date() });
      } catch (err) {
        console.error("Error handler failed:", err);
      }
    });
  }

  /**
   * Notify status handlers
   */
  _notifyStatus(streamId, status) {
    this.statusHandlers.forEach((handler) => {
      try {
        handler({ streamId, status, timestamp: new Date() });
      } catch (err) {
        console.error("Status handler failed:", err);
      }
    });
  }

  /**
   * Get stream analytics
   */
  getStreamStats(streamId) {
    const streamData = this.streams.get(streamId);
    if (!streamData) return null;

    return {
      streamId,
      status: this.status.get(streamId),
      audioTracks: streamData.tracks.audio.length,
      videoTracks: streamData.tracks.video.length,
      quality: streamData.quality,
      facing: streamData.facing,
      uptime: new Date() - streamData.createdAt,
      resolution: this._getResolution(streamData.tracks.video[0]),
    };
  }

  /**
   * Get video track resolution
   */
  _getResolution(videoTrack) {
    if (!videoTrack) return null;
    const settings = videoTrack.getSettings?.();
    if (!settings) return null;

    return {
      width: settings.width,
      height: settings.height,
      frameRate: settings.frameRate,
    };
  }
}

// Singleton instance
export const mediaStreamManager = new MediaStreamManager();
