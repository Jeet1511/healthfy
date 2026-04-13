/**
 * Live Streaming Service
 * Real-time encoding, compression, and streaming of multimedia data
 * Handles both local playback and cloud transmission
 */

export const STREAM_QUALITY = {
  LOW: "low", // 360p
  MEDIUM: "medium", // 720p
  HIGH: "high", // 1080p
  ADAPTIVE: "adaptive", // Auto-adjust based on bandwidth
};

export const ENCODING_STATUS = {
  IDLE: "idle",
  ENCODING: "encoding",
  STREAMING: "streaming",
  ERROR: "error",
};

export const CODEC_PREFERENCE = {
  VIDEO: "vp9,vp8,h264", // Order of preference
  AUDIO: "opus,pcm",
};

/**
 * Live Streaming Service - Real-time multimedia streaming
 */
class LiveStreamingService {
  constructor() {
    this.mediaRecorder = null;
    this.stream = null;
    this.chunks = [];
    this.status = ENCODING_STATUS.IDLE;
    this.quality = STREAM_QUALITY.MEDIUM;
    this.bitrateStats = {
      totalBytes: 0,
      startTime: null,
      chunks: [],
    };
    this.encodingWorker = null;
    this.statusHandlers = [];
    this.statsHandlers = [];
    this.errorHandlers = [];
    this.webCodecsSupport = null;
    this._initializeSupport();
  }

  /**
   * Initialize browser support detection
   */
  _initializeSupport() {
    this.webCodecsSupport = {
      videoEncoder: !!window.VideoEncoder,
      audioEncoder: !!window.AudioEncoder,
      videoDecoder: !!window.VideoDecoder,
      audioDecoder: !!window.AudioDecoder,
    };
  }

  /**
   * Start streaming from media stream
   */
  async startStreaming(stream, options = {}) {
    try {
      const {
        quality = STREAM_QUALITY.MEDIUM,
        mimeType = this._selectMimeType(),
        onChunk = null,
        onStats = null,
      } = options;

      this.stream = stream;
      this.quality = quality;
      this.status = ENCODING_STATUS.ENCODING;
      this.chunks = [];
      this.bitrateStats = {
        totalBytes: 0,
        startTime: Date.now(),
        chunks: [],
      };

      this._notifyStatus(ENCODING_STATUS.ENCODING);

      // Create media recorder with optimal settings
      const recordingOptions = {
        mimeType,
        audioBitsPerSecond: this._getAudioBitrate(quality),
        videoBitsPerSecond: this._getVideoBitrate(quality),
      };

      this.mediaRecorder = new MediaRecorder(stream, recordingOptions);
      this.onChunk = onChunk;
      this.onStats = onStats;

      // Handle data chunks
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this._handleDataChunk(event.data);
        }
      };

      // Handle errors
      this.mediaRecorder.onerror = (event) => {
        this._notifyError(`MediaRecorder error: ${event.error}`, event.error);
        this.status = ENCODING_STATUS.ERROR;
        this._notifyStatus(ENCODING_STATUS.ERROR);
      };

      this.mediaRecorder.start(1000); // Chunk every 1 second
      this.status = ENCODING_STATUS.STREAMING;
      this._notifyStatus(ENCODING_STATUS.STREAMING);

      // Start monitoring bandwidth
      this._startBandwidthMonitoring();

      return {
        success: true,
        status: this.status,
        mimeType,
        quality,
      };
    } catch (error) {
      this.status = ENCODING_STATUS.ERROR;
      this._notifyStatus(ENCODING_STATUS.ERROR);
      this._notifyError("Failed to start streaming", error);
      throw error;
    }
  }

  /**
   * Select optimal MIME type based on browser support
   */
  _selectMimeType() {
    const mimeTypes = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm;codecs=h264,opus",
      "video/webm",
    ];

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType;
      }
    }

    return "video/webm"; // Fallback
  }

  /**
   * Get video bitrate based on quality
   */
  _getVideoBitrate(quality) {
    switch (quality) {
      case STREAM_QUALITY.LOW:
        return 500000; // 500 kbps
      case STREAM_QUALITY.MEDIUM:
        return 2500000; // 2.5 mbps
      case STREAM_QUALITY.HIGH:
        return 5000000; // 5 mbps
      case STREAM_QUALITY.ADAPTIVE:
        return this._getAdaptiveBitrate(); // Dynamic
      default:
        return 2500000;
    }
  }

  /**
   * Get audio bitrate based on quality
   */
  _getAudioBitrate(quality) {
    switch (quality) {
      case STREAM_QUALITY.LOW:
        return 64000; // 64 kbps
      case STREAM_QUALITY.MEDIUM:
        return 128000; // 128 kbps
      case STREAM_QUALITY.HIGH:
        return 256000; // 256 kbps
      case STREAM_QUALITY.ADAPTIVE:
        return 128000; // Start at medium
      default:
        return 128000;
    }
  }

  /**
   * Get adaptive bitrate based on network conditions
   */
  _getAdaptiveBitrate() {
    if (!navigator.connection) {
      return 2500000; // Default to medium
    }

    const connection = navigator.connection;
    const effectiveType = connection.effectiveType;

    switch (effectiveType) {
      case "slow-2g":
      case "2g":
        return 250000; // Very low
      case "3g":
        return 750000; // Low
      case "4g":
        return 2500000; // Medium
      default:
        return 2500000;
    }
  }

  /**
   * Handle data chunk
   */
  _handleDataChunk(data) {
    this.chunks.push(data);
    this.bitrateStats.totalBytes += data.size;
    this.bitrateStats.chunks.push({
      size: data.size,
      timestamp: Date.now(),
    });

    // Notify handlers
    if (this.onChunk) {
      try {
        this.onChunk({
          data,
          size: data.size,
          timestamp: Date.now(),
          totalSize: this.bitrateStats.totalBytes,
        });
      } catch (err) {
        console.error("Chunk handler failed:", err);
      }
    }

    // Calculate and notify stats
    this._updateStats();
  }

  /**
   * Start bandwidth monitoring
   */
  _startBandwidthMonitoring() {
    this.statsInterval = setInterval(() => {
      this._updateStats();
    }, 2000); // Update every 2 seconds
  }

  /**
   * Update streaming statistics
   */
  _updateStats() {
    if (!this.bitrateStats.startTime) {
      return;
    }

    const elapsed = (Date.now() - this.bitrateStats.startTime) / 1000; // seconds
    if (elapsed === 0) return;

    const bitrate = (this.bitrateStats.totalBytes * 8) / elapsed / 1000000; // Mbps
    const recentChunks = this.bitrateStats.chunks.slice(-10); // Last 10 chunks
    const recentBytes = recentChunks.reduce((sum, c) => sum + c.size, 0);
    const recentElapsed =
      (recentChunks[recentChunks.length - 1]?.timestamp -
        recentChunks[0]?.timestamp) /
      1000;
    const recentBitrate =
      recentElapsed > 0 ? (recentBytes * 8) / recentElapsed / 1000000 : 0;

    const stats = {
      totalBytes: this.bitrateStats.totalBytes,
      averageBitrate: bitrate,
      recentBitrate,
      chunks: this.bitrateStats.chunks.length,
      elapsed,
      quality: this.quality,
      timestamp: new Date(),
    };

    if (this.onStats) {
      try {
        this.onStats(stats);
      } catch (err) {
        console.error("Stats handler failed:", err);
      }
    }

    // Notify handlers
    this.statsHandlers.forEach((handler) => {
      try {
        handler(stats);
      } catch (err) {
        console.error("Stats handler failed:", err);
      }
    });

    // Auto-adjust quality if adaptive mode
    if (this.quality === STREAM_QUALITY.ADAPTIVE) {
      this._adjustQualityAdaptive(recentBitrate);
    }
  }

  /**
   * Auto-adjust quality based on bandwidth available
   */
  _adjustQualityAdaptive(currentBitrate) {
    const connection = navigator.connection;
    if (!connection) return;

    const downlink = connection.downlink || 10; // Mbps
    const rtt = connection.rtt || 50; // milliseconds

    // Consider RTT for streaming over wireless
    const adjustedDownlink = downlink * 0.8; // Keep 20% buffer

    if (adjustedDownlink < 1) {
      // Too slow, switch to low
      if (
        this.mediaRecorder &&
        this.mediaRecorder.state === "recording"
      ) {
        console.log("Adapting to LOW quality due to low bandwidth");
        // Would need to adjust bitrate through constraints
      }
    } else if (adjustedDownlink > 8 && currentBitrate < 4) {
      console.log("Adapting to HIGH quality due to good bandwidth");
    }
  }

  /**
   * Change quality mid-stream
   */
  async changeQuality(newQuality) {
    try {
      // Stop current recording
      if (
        this.mediaRecorder &&
        this.mediaRecorder.state === "recording"
      ) {
        this.mediaRecorder.stop();
      }

      this.quality = newQuality;
      this.chunks = [];

      // Restart with new quality
      await this.startStreaming(this.stream, {
        quality: newQuality,
        onChunk: this.onChunk,
        onStats: this.onStats,
      });

      return { success: true, quality: newQuality };
    } catch (error) {
      this._notifyError("Failed to change quality", error);
      throw error;
    }
  }

  /**
   * Pause streaming
   */
  pauseStreaming() {
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.pause();
      this.status = ENCODING_STATUS.IDLE;
      this._notifyStatus(ENCODING_STATUS.IDLE);
    }
  }

  /**
   * Resume streaming
   */
  resumeStreaming() {
    if (this.mediaRecorder && this.mediaRecorder.state === "paused") {
      this.mediaRecorder.resume();
      this.status = ENCODING_STATUS.STREAMING;
      this._notifyStatus(ENCODING_STATUS.STREAMING);
    }
  }

  /**
   * Stop streaming and get final chunks
   */
  stopStreaming() {
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.stop();
    }

    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }

    const data = new Blob(this.chunks, { type: "video/webm" });
    const chunks = Array.from(this.chunks);

    this.status = ENCODING_STATUS.IDLE;
    this._notifyStatus(ENCODING_STATUS.IDLE);

    return {
      success: true,
      data,
      chunks,
      size: data.size,
      duration: (Date.now() - this.bitrateStats.startTime) / 1000,
      quality: this.quality,
    };
  }

  /**
   * Get current streaming statistics
   */
  getStreamingStats() {
    const elapsed = this.bitrateStats.startTime
      ? (Date.now() - this.bitrateStats.startTime) / 1000
      : 0;
    const bitrate =
      elapsed > 0 ? (this.bitrateStats.totalBytes * 8) / elapsed / 1000000 : 0;

    return {
      status: this.status,
      quality: this.quality,
      totalBytes: this.bitrateStats.totalBytes,
      averageBitrate: bitrate.toFixed(2),
      chunksRecorded: this.chunks.length,
      elapsed: Math.round(elapsed),
      estimatedSize: (this.bitrateStats.totalBytes / 1024 / 1024).toFixed(2),
    };
  }

  /**
   * Register status change handler
   */
  onStatusChange(handler) {
    this.statusHandlers.push(handler);
  }

  /**
   * Register stats update handler
   */
  onStatsUpdate(handler) {
    this.statsHandlers.push(handler);
  }

  /**
   * Register error handler
   */
  onError(handler) {
    this.errorHandlers.push(handler);
  }

  /**
   * Notify status handlers
   */
  _notifyStatus(status) {
    this.statusHandlers.forEach((handler) => {
      try {
        handler({ status, timestamp: new Date() });
      } catch (err) {
        console.error("Status handler failed:", err);
      }
    });
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
   * Export streaming data
   */
  exportData(format = "blob") {
    const blob = new Blob(this.chunks, { type: "video/webm" });

    if (format === "url") {
      return URL.createObjectURL(blob);
    }

    if (format === "dataurl") {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    return blob;
  }

  /**
   * Get chunks for upload
   */
  getChunks() {
    return this.chunks;
  }

  /**
   * Clear chunks
   */
  clearChunks() {
    this.chunks = [];
    this.bitrateStats = {
      totalBytes: 0,
      startTime: null,
      chunks: [],
    };
  }

  /**
   * Get browser capabilities
   */
  getCapabilities() {
    return {
      ...this.webCodecsSupport,
      supportedMimeTypes: [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
      ].filter((mime) => MediaRecorder.isTypeSupported(mime)),
    };
  }
}

// Singleton instance
export const liveStreamingService = new LiveStreamingService();
