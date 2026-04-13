/**
 * SOS Service
 * Central orchestration for all emergency response actions
 */

import { EvidenceRecorder, RECORDING_TYPE } from "./recordingService.js";
import { watchLocation, stopWatchingLocation, generateLocationShareLink } from "./locationService.js";
import createChunkUploader from "./chunkUploaderService.js";
import { emergencyAlertService } from "./emergencyAlertService.js";
import { apiClient } from "../api/apiClient";
import { evidenceDashboardService } from "./evidenceDashboardService.js";

const ALERT_QUEUE_KEY = "omina_alert_queue";

function getAuthHeaders() {
  try {
    const raw = JSON.parse(localStorage.getItem("omina_session") || "null");
    if (raw?.token) {
      return { Authorization: `Bearer ${raw.token}` };
    }
  } catch {
    // Ignore parse errors and continue without headers.
  }
  return {};
}

function readAlertQueue() {
  try {
    return JSON.parse(localStorage.getItem(ALERT_QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeAlertQueue(queue) {
  localStorage.setItem(ALERT_QUEUE_KEY, JSON.stringify(queue.slice(-50)));
}

export class SOSHandler {
  constructor(emergencyContext) {
    this.context = emergencyContext;
    this.recorder = null;
    this.locationWatchId = null;
    this.startTime = null;
    this.lastLocationLogSentAt = 0;
    this.backgroundNoticeShown = false;
    this.chunkUploader = createChunkUploader(apiClient, {
      maxRetries: 5,
      retryDelay: 2000,
      onProgress: ({ status, chunkIndex, sessionId }) => {
        if (status === "failed") {
          this.context.addStatusLog(`Chunk ${chunkIndex} queued for retry`, "warning");
        }

        if (sessionId && chunkIndex >= 0) {
          this.refreshChunkQueueStats(sessionId).catch(() => undefined);
        }
      },
    });

    this.handleVisibilityChange = () => {
      if (!document.hidden || this.backgroundNoticeShown) {
        return;
      }

      if (this.context.sosStatus === "recording") {
        this.backgroundNoticeShown = true;
        this.context.addStatusLog("Background evidence capture mode active", "info");
      }
    };
    document.addEventListener("visibilitychange", this.handleVisibilityChange);

    this.handleOnline = () => {
      this.syncQueuedAlerts();
    };
    window.addEventListener("online", this.handleOnline);
  }

  async refreshChunkQueueStats(sessionId) {
    if (!sessionId) {
      return;
    }

    try {
      const stats = await this.chunkUploader.getSessionStats(sessionId);
      this.context.updateEmergencySession({
        queuedChunkUploads: (stats.pending || 0) + (stats.failed || 0),
        uploadedChunkCount: stats.uploaded || 0,
      });
    } catch {
      // Ignore stats failures to keep SOS flow non-blocking.
    }
  }

  /**
   * Trigger SOS alert
   */
  async trigger(metadata = {}) {
    this.startTime = new Date();
    this.context.enterEmergencyMode(metadata.triggerSource || "sos");
    this.context.triggerSOS({ triggerSource: metadata.triggerSource || "sos" });
    this.context.addStatusLog("🚨 SOS TRIGGERED - Starting emergency protocol", "error");
    this.backgroundNoticeShown = false;
    this.context.updateEmergencySession({
      silentMode: Boolean(metadata.silentMode),
    });

    try {
      const evidenceSessionId = await this.initializeEvidenceSession({
        triggerSource: metadata.triggerSource || "sos",
        silentMode: Boolean(metadata.silentMode),
        chunkDurationMs: 10000,
      });

      // Start location tracking
      await this.startLocationTracking();

      // Start audio + video recording with fallback
      await this.startRecording(evidenceSessionId);

      // Notify emergency contacts with retry queue fallback
      await this.notifyEmergencyContacts();
      await this.syncQueuedAlerts();

      // Get current location for alerts
      const location = this.context.location;
      this.context.addStatusLog(`📍 Location acquired: ${location?.latitude}, ${location?.longitude}`, "success");

      if (this.context.emergencySession?.evidenceSessionId) {
        await evidenceDashboardService.logSessionEvent(this.context.emergencySession.evidenceSessionId, {
          type: "alerts_sent",
          label: "Emergency contacts notification flow executed",
          severity: "info",
        });
      }

      return true;
    } catch (error) {
      this.context.addStatusLog(`❌ Error during SOS activation: ${error.message}`, "error");
      console.error("SOS trigger error:", error);
      return false;
    }
  }

  async initializeEvidenceSession(options = {}) {
    const triggerSource = options.triggerSource || "sos";
    const silentMode = Boolean(options.silentMode);
    const chunkDurationMs = Number(options.chunkDurationMs || 10000);

    const fallbackSessionId =
      this.context.emergencySession?.evidenceSessionId ||
      this.context.emergencySession?.id ||
      `emg_${Date.now()}`;

    try {
      const preferredSessionId =
        this.context.emergencySession?.evidenceSessionId ||
        this.context.emergencySession?.id ||
        undefined;

      const started = await evidenceDashboardService.startSession({
        sessionId: preferredSessionId,
        recordingType: RECORDING_TYPE.AUDIO_VIDEO,
        mode: "emergency",
        triggerSource,
        metadata: {
          networkOnline: navigator.onLine,
          silentMode,
          backgroundRecording: true,
          chunkDurationMs,
        },
      });

      this.context.updateEmergencySession({
        evidenceSessionId: started?.sessionId || preferredSessionId || fallbackSessionId,
        evidenceState: started?.state || "active",
      });

      this.context.addStatusLog("Evidence session initialized", "info");
      return started?.sessionId || preferredSessionId || fallbackSessionId;
    } catch (error) {
      this.context.addStatusLog("Could not initialize evidence session. Continuing with local fail-safe.", "warning");
      this.context.updateEmergencySession({
        evidenceSessionId: fallbackSessionId,
        evidenceState: "active",
      });
      return fallbackSessionId;
    }
  }

  /**
   * Start location tracking
   */
  async startLocationTracking() {
    try {
      this.locationWatchId = watchLocation(
        (location) => {
          this.context.setLocation(location);
          this.context.setSosMetadata((prev) => ({
            ...prev,
            location,
          }));
          this.syncEvidenceLocationLog(location).catch(() => undefined);
        },
        (error) => {
          this.context.addStatusLog(`⚠️ Location tracking error: ${error.message}`, "warning");
        },
        "HIGH"
      );

      this.context.setLocationWatchId(this.locationWatchId);
      this.context.addStatusLog("📍 Location tracking started", "info");
    } catch (error) {
      this.context.addStatusLog(`❌ Failed to start location tracking: ${error.message}`, "error");
    }
  }

  async syncEvidenceLocationLog(location) {
    const sessionId = this.context.emergencySession?.evidenceSessionId;
    if (!sessionId) {
      return;
    }

    const now = Date.now();
    if (now - this.lastLocationLogSentAt < 3500) {
      return;
    }
    this.lastLocationLogSentAt = now;

    try {
      await evidenceDashboardService.appendLocationLog({
        sessionId,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        speed: location.speed,
        heading: location.heading,
        source: location.source || "gps",
        mode: "emergency",
        reason: "watch",
        timestamp: new Date(location.timestamp || Date.now()).toISOString(),
      });
    } catch {
      // Ignore upload errors - location logs are retried by other sync channels.
    }
  }

  /**
   * Start recording (audio + video)
   */
  async startRecording(preferredSessionId = null) {
    try {
      const chunkDurationMs = 10000;

      this.recorder = new EvidenceRecorder({
        recordingType: RECORDING_TYPE.AUDIO_VIDEO,
        chunkDuration: chunkDurationMs,
        onChunkReady: async (chunkPayload) => {
          await this.uploadRecordingChunk(chunkPayload);
        },
      });

      const sessionId =
        preferredSessionId ||
        this.context.emergencySession?.evidenceSessionId ||
        this.context.emergencySession?.id ||
        this.context.sosTriggeredAt?.toString();
      const success = await this.recorder.start(sessionId);
      if (success) {
        const stats = this.recorder.getStats();
        const hasAudio = Boolean(stats.audioActive);
        const hasVideo = Boolean(stats.videoActive);

        this.context.setIsRecordingAudio(hasAudio);
        this.context.setIsRecordingVideo(hasVideo);
        this.context.setRecordingStartTime(new Date());
        this.context.setSosStatus("recording");
        this.context.updateEmergencySession({
          backgroundRecording: true,
          recordingChunkDurationMs: chunkDurationMs,
        });

        if (hasAudio && hasVideo) {
          this.context.addStatusLog("🎙️🎥 Audio/video recording started", "info");
        } else if (hasAudio) {
          this.context.addStatusLog("🎙️ Video unavailable, continuing with audio-only recording", "warning");
        } else if (hasVideo) {
          this.context.addStatusLog("🎥 Microphone unavailable, continuing with video-only recording", "warning");
        } else {
          this.context.addStatusLog("⚠️ Recording started with limited media tracks", "warning");
        }

        this.context.setSosMetadata((prev) => ({
          ...prev,
          hasAudio,
          hasVideo,
        }));

        if (this.context.emergencySession?.evidenceSessionId) {
          await evidenceDashboardService.logSessionEvent(this.context.emergencySession.evidenceSessionId, {
            type: "recording_profile",
            label: `Recording profile set to ${hasAudio && hasVideo ? "audio-video" : hasAudio ? "audio-only" : hasVideo ? "video-only" : "location-only"}`,
            severity: hasAudio || hasVideo ? "info" : "warning",
            payload: {
              hasAudio,
              hasVideo,
            },
          });
        }
      }
    } catch (error) {
      this.context.addStatusLog(`⚠️ Recording unavailable: ${error.message}`, "warning");
    }
  }

  /**
   * Notify emergency contacts
   */
  async notifyEmergencyContacts() {
    const { emergencyProfile, location } = this.context;

    if (!emergencyProfile.emergencyContacts || emergencyProfile.emergencyContacts.length === 0) {
      this.context.addStatusLog("⚠️ No emergency contacts configured", "warning");
      return;
    }

    const locationLink = location
      ? generateLocationShareLink(location.latitude, location.longitude)
      : null;

    const message = {
      name: emergencyProfile.name || "Unknown User",
      phone: emergencyProfile.phone || "Not provided",
      location: locationLink,
      bloodGroup: emergencyProfile.bloodGroup,
      medicalConditions: emergencyProfile.medicalConditions,
      timestamp: new Date().toISOString(),
      status: "User triggered SOS",
    };

    try {
      emergencyAlertService.sendNotification("Emergency Active", {
        body: "SOS triggered. Trusted contacts are being notified.",
      });

      const alertPayload = {
        location,
        hasAudio: this.context.isRecordingAudio,
        hasVideo: this.context.isRecordingVideo,
      };

      await this.sendAlertToBackend(alertPayload);

      const contactsToNotify = emergencyProfile.emergencyContacts.slice(0, 5); // Max 5 contacts

      for (const contact of contactsToNotify) {
        try {
          // Send via SMS/email fallback channel metadata.
          await this.sendSMS(contact.phone, message);

          if (contact.email) {
            await this.sendEmail(contact.email, message);
          }

          this.context.setSosMetadata((prev) => ({
            ...prev,
            contactsNotified: [...(prev.contactsNotified || []), contact.name],
          }));

          this.context.addStatusLog(`✓ Notified ${contact.name}`, "success");
        } catch (error) {
          this.context.addStatusLog(`❌ Failed to notify ${contact.name}`, "error");
        }
      }
    } catch (error) {
      this.context.addStatusLog(`❌ Error notifying contacts: ${error.message}`, "error");
    }
  }

  async sendAlertToBackend(payload, fromQueue = false) {
    try {
      await apiClient.post("/sos/trigger", payload, {
        headers: getAuthHeaders(),
        timeout: 7000,
      });
      return true;
    } catch (error) {
      if (!fromQueue) {
        const queue = readAlertQueue();
        queue.push({
          payload,
          queuedAt: new Date().toISOString(),
          retryCount: 0,
        });
        writeAlertQueue(queue);
        this.context.updateEmergencySession({ queuedAlerts: queue.length });
        this.context.addStatusLog("Alert queued for retry", "warning");
      }
      return false;
    }
  }

  async syncQueuedAlerts() {
    if (!navigator.onLine) {
      return;
    }

    const queue = readAlertQueue();
    if (queue.length === 0) {
      this.context.updateEmergencySession({ queuedAlerts: 0 });
      return;
    }

    const remaining = [];

    for (const item of queue) {
      // eslint-disable-next-line no-await-in-loop
      const sent = await this.sendAlertToBackend(item.payload, true);
      if (!sent) {
        remaining.push({
          ...item,
          retryCount: (item.retryCount || 0) + 1,
        });
      }
    }

    writeAlertQueue(remaining);
    this.context.updateEmergencySession({ queuedAlerts: remaining.length });
  }

  /**
   * Deactivate SOS
   */
  async deactivate() {
    this.context.addStatusLog("🛑 SOS deactivated", "info");

    try {
      // Stop location tracking
      if (this.locationWatchId !== null) {
        stopWatchingLocation(this.locationWatchId);
        this.context.setLocationWatchId(null);
        this.locationWatchId = null;
        this.context.addStatusLog("📍 Location tracking stopped", "info");
      }

      // Stop recording
      if (this.recorder) {
        await this.recorder.stop();
        this.context.setIsRecordingAudio(false);
        this.context.setIsRecordingVideo(false);
        this.context.addStatusLog("🎙️🎥 Recording stopped", "info");
      }

      if (this.context.emergencySession?.evidenceSessionId) {
        await this.chunkUploader.syncPendingUploads(this.context.emergencySession.evidenceSessionId);
        await this.refreshChunkQueueStats(this.context.emergencySession.evidenceSessionId);
      }

      if (this.context.emergencySession?.evidenceSessionId) {
        const complete = await evidenceDashboardService.completeSession(
          this.context.emergencySession.evidenceSessionId,
          {
            notes: "Emergency SOS deactivated",
          }
        );
        this.context.updateEmergencySession({
          evidenceState: complete?.state || "completed",
        });
      }

      this.context.setSosStatus("cooldown");
      this.context.setRecordingStartTime(null);
    } catch (error) {
      this.context.addStatusLog(`❌ Error during deactivation: ${error.message}`, "error");
    }
  }

  /**
   * Upload recording chunk to server
   */
  async uploadRecordingChunk(chunkPayload) {
    try {
      const metadata = {
        sessionId:
          chunkPayload.sessionId ||
          this.context.emergencySession?.evidenceSessionId ||
          this.context.emergencySession?.id ||
          String(this.startTime?.getTime() || Date.now()),
        chunkIndex: chunkPayload.chunkIndex,
        timestamp: chunkPayload.timestamp,
        duration: chunkPayload.duration,
        location: this.context.location,
      };

      const result = await this.chunkUploader.uploadChunk(chunkPayload.blob, metadata);

      if (metadata.sessionId) {
        await this.refreshChunkQueueStats(metadata.sessionId);
      }

      if (result?.queued) {
        this.context.addStatusLog(`Chunk ${metadata.chunkIndex} queued for upload retry`, "warning");
      }
    } catch (error) {
      console.error("Failed to upload chunk:", error);
    }
  }

  /**
   * Upload final recording
   */
  async uploadRecording(type, blob) {
    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("file", blob);
      formData.append("sosId", this.startTime?.getTime());

      // In production, implement actual upload
      // const response = await fetch("/api/sos/upload-recording", {
      //   method: "POST",
      //   body: formData,
      // });

      console.log(`[MOCK] Uploaded final ${type} recording (${(blob.size / 1024).toFixed(2)}KB)`);
    } catch (error) {
      console.error(`Failed to upload ${type} recording:`, error);
    }
  }

  /**
   * Send SMS notification
   */
  async sendSMS(phone, message) {
    try {
      // In production, integrate with Twilio or similar
      // const response = await fetch("/api/sos/send-sms", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ phone, message }),
      // });

      console.log(`[MOCK] SMS sent to ${phone}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send email notification
   */
  async sendEmail(email, message) {
    try {
      // In production, integrate with SendGrid or similar
      // const response = await fetch("/api/sos/send-email", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email, message }),
      // });

      console.log(`[MOCK] Email sent to ${email}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get SOS summary
   */
  getSummary() {
    const duration = this.startTime ? new Date() - this.startTime : 0;
    const seconds = Math.floor((duration % 60000) / 1000);

    return {
      startTime: this.startTime,
      duration: duration,
      durationFormatted: `${Math.floor(duration / 60000)}:${String(seconds).padStart(2, "0")}`,
      location: this.context.location,
      hasAudio: this.context.isRecordingAudio,
      hasVideo: this.context.isRecordingVideo,
      contactsNotified: this.context.sosMetadata.contactsNotified,
      logs: this.context.statusLogs,
    };
  }

  destroy() {
    window.removeEventListener("online", this.handleOnline);
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    this.chunkUploader.destroy?.();
  }
}

/**
 * Create SOS handler instance for a context
 */
export function createSOSHandler(emergencyContext) {
  return new SOSHandler(emergencyContext);
}
