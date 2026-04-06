/**
 * Emergency Contact Alert Service
 * Notifies emergency contacts when SOS is triggered
 */

export class EmergencyAlertService {
  constructor() {
    this.apiClient = null;
  }

  /**
   * Initialize with API client
   */
  initialize(apiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Send alert to emergency contacts
   */
  async sendAlert(sessionId, contactEmails, emergencyInfo = {}) {
    try {
      if (!this.apiClient) {
        throw new Error("AlertService not initialized");
      }

      const response = await this.apiClient.post(
        `/api/evidence/${sessionId}/share`,
        {
          contactEmails,
          metadata: emergencyInfo,
        }
      );

      console.log("Alert sent successfully");
      return response.data;
    } catch (error) {
      console.error("Failed to send alert:", error);
      throw error;
    }
  }

  /**
   * Send SMS alert (if configured)
   */
  async sendSMSAlert(phoneNumbers, message) {
    try {
      const response = await this.apiClient.post("/api/alerts/sms", {
        phoneNumbers,
        message,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to send SMS:", error);
      return null;
    }
  }

  /**
   * Send in-app notification
   */
  sendNotification(title, options = {}) {
    if (!("Notification" in window)) {
      console.warn("Notifications not supported");
      return;
    }

    if (Notification.permission === "granted") {
      return new Notification(title, {
        icon: "🚨",
        badge: "🚨",
        tag: "emergency",
        requireInteraction: true,
        ...options,
      });
    }
  }

  /**
   * Send push notification to registered devices
   */
  async sendPushNotification(deviceTokens, payload) {
    try {
      const response = await this.apiClient.post("/api/alerts/push", {
        deviceTokens,
        payload,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to send push notification:", error);
      return null;
    }
  }

  /**
   * Send multi-channel alert
   */
  async sendMultiChannelAlert(sessionId, recipients = {}) {
    const {
      emails = [],
      phoneNumbers = [],
      deviceTokens = [],
      location = null,
    } = recipients;

    const results = [];

    try {
      // Email alerts
      if (emails.length > 0) {
        const emailResult = await this.sendAlert(sessionId, emails, {
          location,
          timestamp: new Date(),
        });
        results.push({ channel: "email", success: true, data: emailResult });
      }

      // SMS alerts
      if (phoneNumbers.length > 0) {
        const message = `🚨 Emergency Alert: Evidence recorded at ${location ? `${location.latitude.toFixed(4)},${location.longitude.toFixed(4)}` : "unknown location"}. Session: ${sessionId}`;
        const smsResult = await this.sendSMSAlert(phoneNumbers, message);
        results.push({
          channel: "sms",
          success: !!smsResult,
          data: smsResult,
        });
      }

      // Push notifications
      if (deviceTokens.length > 0) {
        const pushResult = await this.sendPushNotification(deviceTokens, {
          title: "🚨 Emergency Alert",
          body: "Evidence recording triggered. Tap to view details.",
          sessionId,
        });
        results.push({
          channel: "push",
          success: !!pushResult,
          data: pushResult,
        });
      }

      return results;
    } catch (error) {
      console.error("Multi-channel alert error:", error);
      throw error;
    }
  }

  /**
   * Create alert template
   */
  createAlertTemplate(type = "default") {
    const templates = {
      default: {
        subject: "🚨 Emergency Alert - Evidence Recorded",
        body: `An emergency SOS event has been triggered and evidence is being recorded and securely uploaded to the cloud.

Session ID: {sessionId}
Time: {timestamp}
Location: {location}

You can view the evidence at: {evidenceLink}

Please verify the emergency status immediately if you are the recipient of this alert.`,
      },
      detailed: {
        subject: "Emergency Alert - Detailed Report",
        body: `EMERGENCY ALERT NOTIFICATION

Incident Details:
- Session ID: {sessionId}
- Triggered: {timestamp}
- Location: {latitude}, {longitude}
- Recording Type: {recordingType}
- Duration: {duration}

Evidence Links: {evidenceLink}

Contact Information:
- Recorded By: {userName}
- Phone: {userPhone}
- Email: {userEmail}

Uploaded Chunks: {uploadedChunks}/{totalChunks}
Upload Status: {uploadStatus}

If you received this in error, please reply to this email.`,
      },
    };

    return templates[type] || templates.default;
  }

  /**
   * Format alert message with data
   */
  formatAlertMessage(template, data) {
    let message = template;

    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      message = message.replace(new RegExp(placeholder, "g"), value || "N/A");
    });

    return message;
  }
}

// Create singleton
export const emergencyAlertService = new EmergencyAlertService();
