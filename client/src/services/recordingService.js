/**
 * Enhanced Evidence Recording Service
 * Real-time audio/video recording with chunk uploads
 */

export const RECORDING_STATUS = {
  IDLE: "idle",
  RECORDING: "recording",
  PAUSED: "paused",
  UPLOADING: "uploading",
  ERROR: "error",
  COMPLETED: "completed",
};

export const RECORDING_TYPE = {
  AUDIO_ONLY: "audio-only",
  AUDIO_VIDEO: "audio-video",
};

/**
 * Enhanced Evidence Recorder with cloud upload
 */
export class EvidenceRecorder {
  constructor(options = {}) {
    this.mediaRecorder = null;
    this.stream = null;
    this.chunks = [];
    this.status = RECORDING_STATUS.IDLE;
    this.recordingType = options.recordingType || RECORDING_TYPE.AUDIO_VIDEO;

    // Recording configuration
    this.mimeType = this.getMimeType(this.recordingType);
    this.chunkDuration = options.chunkDuration || 2000; // 2 seconds for real-time chunks
    this.chunkTimer = null;

    // Cloud upload configuration
    this.onChunkReady = options.onChunkReady || null; // Called when chunk is ready to upload
    this.onStatusChange = options.onStatusChange || null;
    this.onError = options.onError || null;

    // Session tracking
    this.sessionId = null;
    this.startTime = null;
    this.chunkIndex = 0;
    this.uploadedChunks = 0;

    // Audio/Video tracks for debugging
    this.audioTrack = null;
    this.videoTrack = null;
  }

  /**
   * Determine appropriate MIME type
   */
  getMimeType(recordingType) {
    if (recordingType === RECORDING_TYPE.AUDIO_ONLY) {
      return "audio/webm";
    }
    // Try different MIME types for video
    const mimeTypes = ["video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
    for (const mime of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mime)) {
        return mime;
      }
    }
    return "video/webm";
  }

  /**
   * Start recording with real-time chunking
   */
  async start(sessionId) {
    try {
      this.sessionId = sessionId;
      this.startTime = new Date();
      this.chunkIndex = 0;
      this.uploadedChunks = 0;

      const constraints = this.getConstraints();

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("MediaRecorder not supported");
      }

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Track audio/video state
      this.audioTrack = this.stream.getAudioTracks()[0] || null;
      this.videoTrack = this.stream.getVideoTracks()[0] || null;

      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: this.mimeType });

      // Collect data for chunking
      this.chunks = [];
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.onerror = (error) => {
        this.setStatus(RECORDING_STATUS.ERROR);
        if (this.onError) {
          this.onError(error);
        }
      };

      this.mediaRecorder.start();
      this.setStatus(RECORDING_STATUS.RECORDING);

      // Start auto-chunk extraction for real-time upload
      this.startChunkExtraction();

      return true;
    } catch (error) {
      this.setStatus(RECORDING_STATUS.ERROR);
      if (this.onError) {
        this.onError(error);
      }
      console.error("Failed to start recording:", error);
      return false;
    }
  }

  /**
   * Get media constraints based on recording type
   */
  getConstraints() {
    if (this.recordingType === RECORDING_TYPE.AUDIO_ONLY) {
      return { audio: true };
    }

    return {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        facingMode: "user",
      },
    };
  }

  /**
   * Extract and emit chunks for upload at regular intervals
   */
  startChunkExtraction() {
    this.chunkTimer = setInterval(() => {
      if (this.status === RECORDING_STATUS.RECORDING && this.chunks.length > 0) {
        const blob = new Blob(this.chunks, { type: this.mimeType });
        const timestamp = new Date();

        if (this.onChunkReady) {
          this.onChunkReady({
            blob,
            chunkIndex: this.chunkIndex,
            timestamp,
            sessionId: this.sessionId,
            duration: this.chunkDuration,
          });
        }

        this.chunkIndex++;
        this.chunks = [];
      }
    }, this.chunkDuration);
  }

  /**
   * Pause recording
   */
  pause() {
    if (this.mediaRecorder && this.status === RECORDING_STATUS.RECORDING) {
      this.mediaRecorder.pause();
      this.setStatus(RECORDING_STATUS.PAUSED);
    }
  }

  /**
   * Resume recording
   */
  resume() {
    if (this.mediaRecorder && this.status === RECORDING_STATUS.PAUSED) {
      this.mediaRecorder.resume();
      this.setStatus(RECORDING_STATUS.RECORDING);
    }
  }

  /**
   * Stop recording
   */
  async stop() {
    return new Promise((resolve) => {
      if (this.mediaRecorder) {
        this.mediaRecorder.onstop = () => {
          clearInterval(this.chunkTimer);
          this.cleanup();
          this.setStatus(RECORDING_STATUS.COMPLETED);
          resolve({
            sessionId: this.sessionId,
            duration: Date.now() - this.startTime,
            totalChunks: this.chunkIndex,
            uploadedChunks: this.uploadedChunks,
          });
        };
        this.mediaRecorder.stop();
      } else {
        resolve(null);
      }
    });
  }

  /**
   * Get recording duration in seconds
   */
  getDuration() {
    if (!this.startTime) return 0;
    return Math.round((Date.now() - this.startTime) / 1000);
  }

  /**
   * Clean up resources
   */
  cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        track.stop();
      });
    }
    if (this.chunkTimer) {
      clearInterval(this.chunkTimer);
    }
    this.mediaRecorder = null;
    this.stream = null;
  }

  /**
   * Update recording status
   */
  setStatus(newStatus) {
    this.status = newStatus;
    if (this.onStatusChange) {
      this.onStatusChange(newStatus);
    }
  }

  /**
   * Mark chunk as uploaded
   */
  markChunkUploaded(chunkIndex) {
    if (chunkIndex === this.uploadedChunks) {
      this.uploadedChunks++;
    }
  }

  /**
   * Get recording statistics
   */
  getStats() {
    return {
      status: this.status,
      sessionId: this.sessionId,
      duration: this.getDuration(),
      recordingType: this.recordingType,
      chunkIndex: this.chunkIndex,
      uploadedChunks: this.uploadedChunks,
      audioActive: this.audioTrack?.enabled || false,
      videoActive: this.videoTrack?.enabled || false,
    };
  }

  /**
   * Switch camera (front/back for mobile)
   */
  async switchCamera(facingMode = "environment") {
    try {
      if (!this.videoTrack) {
        throw new Error("Video not enabled");
      }

      // Stop current video track
      this.videoTrack.stop();

      // Get new stream with different camera
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode },
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      if (!newVideoTrack) {
        throw new Error("No video track available");
      }

      // Replace video track in stream
      await this.mediaRecorder.requestData(); // Flush current data
      this.stream.removeTrack(this.videoTrack);
      this.stream.addTrack(newVideoTrack);
      this.videoTrack = newVideoTrack;

      return true;
    } catch (error) {
      console.error("Failed to switch camera:", error);
      return false;
    }
  }

  /**
   * Toggle audio recording
   */
  toggleAudio(enabled) {
    if (this.audioTrack) {
      this.audioTrack.enabled = enabled;
      return true;
    }
    return false;
  }

  /**
   * Toggle video recording
   */
  toggleVideo(enabled) {
    if (this.videoTrack) {
      this.videoTrack.enabled = enabled;
      return true;
    }
    return false;
  }
}

/**
 * Detect distress keywords in audio
 */
export const DISTRESS_KEYWORDS = [
  "help",
  "save",
  "emergency",
  "danger",
  "attack",
  "fire",
  "police",
  "call 911",
  "mayday",
];

/**
 * Check if text contains distress keyword
 */
export function detectDistressKeyword(text) {
  const lowerText = text.toLowerCase();
  return DISTRESS_KEYWORDS.some((keyword) => lowerText.includes(keyword));
}
