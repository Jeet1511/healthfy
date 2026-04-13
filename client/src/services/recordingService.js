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
  VIDEO_ONLY: "video-only",
  AUDIO_VIDEO: "audio-video",
};

/**
 * Enhanced Evidence Recorder with cloud upload
 */
export class EvidenceRecorder {
  constructor(options = {}) {
    this.mediaRecorder = null;
    this.stream = null;
    this.status = RECORDING_STATUS.IDLE;
    this.recordingType = options.recordingType || RECORDING_TYPE.AUDIO_VIDEO;

    // Recording configuration
    this.mimeType = this.getMimeType(this.recordingType);
    this.chunkDuration = options.chunkDuration || 10000; // 10 seconds for resilient chunking

    // Cloud upload configuration
    this.onChunkReady = options.onChunkReady || null; // Called when chunk is ready to upload
    this.onStatusChange = options.onStatusChange || null;
    this.onError = options.onError || null;

    // Session tracking
    this.sessionId = null;
    this.startTime = null;
    this.chunkIndex = 0;
    this.uploadedChunks = 0;
    this.visibilityHandler = null;

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

    if (recordingType === RECORDING_TYPE.VIDEO_ONLY) {
      const videoTypes = ["video/webm;codecs=vp8", "video/webm", "video/mp4"];
      for (const mime of videoTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          return mime;
        }
      }
      return "video/webm";
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

      if (!window.MediaRecorder || !navigator.mediaDevices?.getUserMedia) {
        throw new Error("MediaRecorder not supported");
      }

      const attempts = this.getConstraintAttempts();
      let lastError = null;

      for (const attempt of attempts) {
        try {
          this.recordingType = attempt.type;
          this.mimeType = this.getMimeType(attempt.type);
          this.stream = await navigator.mediaDevices.getUserMedia(attempt.constraints);
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (!this.stream) {
        throw lastError || new Error("No media input available");
      }

      // Track audio/video state
      this.audioTrack = this.stream.getAudioTracks()[0] || null;
      this.videoTrack = this.stream.getVideoTracks()[0] || null;

      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: this.mimeType });

      // Emit fixed-size chunks from MediaRecorder directly to avoid timer throttling.
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size === 0) {
          return;
        }

        const payload = {
          blob: event.data,
          chunkIndex: this.chunkIndex,
          timestamp: new Date(),
          sessionId: this.sessionId,
          duration: this.chunkDuration,
        };

        this.chunkIndex += 1;

        if (this.onChunkReady) {
          Promise.resolve(this.onChunkReady(payload)).catch((uploadError) => {
            console.error("Chunk callback failed:", uploadError);
          });
        }
      };

      this.mediaRecorder.onerror = (error) => {
        this.setStatus(RECORDING_STATUS.ERROR);
        if (this.onError) {
          this.onError(error);
        }
      };

      this.visibilityHandler = () => {
        if (document.hidden && this.mediaRecorder?.state === "recording") {
          try {
            this.mediaRecorder.requestData();
          } catch {
            // Ignore flush errors and continue recording.
          }
        }
      };
      document.addEventListener("visibilitychange", this.visibilityHandler);

      this.mediaRecorder.start(this.chunkDuration);
      this.setStatus(RECORDING_STATUS.RECORDING);

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

  getConstraintAttempts() {
    if (this.recordingType === RECORDING_TYPE.AUDIO_ONLY) {
      return [{ type: RECORDING_TYPE.AUDIO_ONLY, constraints: { audio: true } }];
    }

    if (this.recordingType === RECORDING_TYPE.VIDEO_ONLY) {
      return [{ type: RECORDING_TYPE.VIDEO_ONLY, constraints: { video: this.getVideoConstraints() } }];
    }

    return [
      {
        type: RECORDING_TYPE.AUDIO_VIDEO,
        constraints: {
          audio: this.getAudioConstraints(),
          video: this.getVideoConstraints(),
        },
      },
      {
        type: RECORDING_TYPE.AUDIO_ONLY,
        constraints: { audio: this.getAudioConstraints() },
      },
      {
        type: RECORDING_TYPE.VIDEO_ONLY,
        constraints: { video: this.getVideoConstraints() },
      },
    ];
  }

  getAudioConstraints() {
    return {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    };
  }

  getVideoConstraints() {
    return {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      facingMode: "user",
    };
  }

  /**
   * Get media constraints based on recording type
   */
  getConstraints() {
    if (this.recordingType === RECORDING_TYPE.AUDIO_ONLY) {
      return { audio: this.getAudioConstraints() };
    }

    if (this.recordingType === RECORDING_TYPE.VIDEO_ONLY) {
      return { video: this.getVideoConstraints() };
    }

    return {
      audio: this.getAudioConstraints(),
      video: this.getVideoConstraints(),
    };
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
        if (this.mediaRecorder.state === "recording") {
          try {
            this.mediaRecorder.requestData();
          } catch {
            // Ignore final flush issues.
          }
        }

        this.mediaRecorder.onstop = () => {
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
    if (this.visibilityHandler) {
      document.removeEventListener("visibilitychange", this.visibilityHandler);
      this.visibilityHandler = null;
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
