/**
 * SOS Service
 * Central orchestration for all emergency response actions
 */

import { EvidenceRecorder, RECORDING_TYPE } from "./recordingService.js";
import { watchLocation, stopWatchingLocation, generateLocationShareLink } from "./locationService.js";

export class SOSHandler {
  constructor(emergencyContext) {
    this.context = emergencyContext;
    this.recorder = null;
    this.locationWatchId = null;
    this.startTime = null;
  }

  /**
   * Trigger SOS alert
   */
  async trigger() {
    this.startTime = new Date();
    this.context.triggerSOS();
    this.context.addStatusLog("🚨 SOS TRIGGERED - Starting emergency protocol", "error");

    try {
      // Start location tracking
      await this.startLocationTracking();

      // Start audio + video recording
      await this.startRecording();

      // Notify emergency contacts
      this.notifyEmergencyContacts();

      // Get current location for alerts
      const location = this.context.location;
      this.context.addStatusLog(`📍 Location acquired: ${location?.latitude}, ${location?.longitude}`, "success");

      return true;
    } catch (error) {
      this.context.addStatusLog(`❌ Error during SOS activation: ${error.message}`, "error");
      console.error("SOS trigger error:", error);
      return false;
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

  /**
   * Start recording (audio + video)
   */
  async startRecording() {
    try {
      this.recorder = new EvidenceRecorder({
        recordingType: RECORDING_TYPE.AUDIO_VIDEO,
        onChunkReady: async (blob, timestamp) => {
          // Upload chunk to server or cloud storage
          await this.uploadRecordingChunk("audio-video", blob, timestamp);
        },
      });

      const success = await this.recorder.start(this.context.sosTriggeredAt?.toString());
      if (success) {
        this.context.setIsRecordingAudio(true);
        this.context.setIsRecordingVideo(true);
        this.context.setRecordingStartTime(new Date());
        this.context.addStatusLog("🎙️ Audio/video recording started", "info");
        this.context.setSosMetadata((prev) => ({
          ...prev,
          hasAudio: true,
          hasVideo: true,
        }));
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
    };

    try {
      const contactsToNotify = emergencyProfile.emergencyContacts.slice(0, 5); // Max 5 contacts

      for (const contact of contactsToNotify) {
        try {
          // Send via SMS (integration with Twilio or similar)
          await this.sendSMS(contact.phone, message);

          // Send via email
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
        this.context.addStatusLog("📍 Location tracking stopped", "info");
      }

      // Stop recording
      if (this.recorder) {
        const recordingBlob = await this.recorder.stop();
        if (recordingBlob) {
          await this.uploadRecording("audio-video", recordingBlob);
        }
        this.context.setIsRecordingAudio(false);
        this.context.setIsRecordingVideo(false);
        this.context.addStatusLog("🎙️🎥 Recording stopped", "info");
      }

      this.context.setRecordingStartTime(null);
    } catch (error) {
      this.context.addStatusLog(`❌ Error during deactivation: ${error.message}`, "error");
    }
  }

  /**
   * Upload recording chunk to server
   */
  async uploadRecordingChunk(type, blob, timestamp) {
    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("file", blob);
      formData.append("timestamp", timestamp.toISOString());
      formData.append("sosId", this.startTime?.getTime());

      // In production, implement actual upload
      // const response = await fetch("/api/sos/upload-chunk", {
      //   method: "POST",
      //   body: formData,
      // });

      console.log(`[MOCK] Uploaded ${type} chunk (${(blob.size / 1024).toFixed(2)}KB)`);
    } catch (error) {
      console.error(`Failed to upload ${type} chunk:`, error);
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

    return {
      startTime: this.startTime,
      duration: duration,
      durationFormatted: `${Math.floor(duration / 60000)}:${String((duration % 60000) / 1000).padStart(2, "0")}`,
      location: this.context.location,
      hasAudio: this.context.isRecordingAudio,
      hasVideo: this.context.isRecordingVideo,
      contactsNotified: this.context.sosMetadata.contactsNotified,
      logs: this.context.statusLogs,
    };
  }
}

/**
 * Create SOS handler instance for a context
 */
export function createSOSHandler(emergencyContext) {
  return new SOSHandler(emergencyContext);
}
