/**
 * Permission Handler Service
 * Manages camera, microphone, location, and notification permissions
 */

export const PERMISSION_STATUS = {
  GRANTED: "granted",
  DENIED: "denied",
  PROMPT: "prompt",
};

export const PERMISSION_TYPES = {
  CAMERA: "camera",
  MICROPHONE: "microphone",
  LOCATION: "location",
  NOTIFICATIONS: "notifications",
};

class PermissionHandler {
  constructor() {
    this.permissions = new Map();
  }

  /**
   * Check and request camera permission
   */
  async requestCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      this.permissions.set(PERMISSION_TYPES.CAMERA, PERMISSION_STATUS.GRANTED);
      return PERMISSION_STATUS.GRANTED;
    } catch (error) {
      if (error.name === "NotAllowedError") {
        this.permissions.set(PERMISSION_TYPES.CAMERA, PERMISSION_STATUS.DENIED);
        return PERMISSION_STATUS.DENIED;
      }
      throw error;
    }
  }

  /**
   * Check and request microphone permission
   */
  async requestMicrophone() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      this.permissions.set(PERMISSION_TYPES.MICROPHONE, PERMISSION_STATUS.GRANTED);
      return PERMISSION_STATUS.GRANTED;
    } catch (error) {
      if (error.name === "NotAllowedError") {
        this.permissions.set(PERMISSION_TYPES.MICROPHONE, PERMISSION_STATUS.DENIED);
        return PERMISSION_STATUS.DENIED;
      }
      throw error;
    }
  }

  /**
   * Check and request location permission
   */
  async requestLocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        this.permissions.set(PERMISSION_TYPES.LOCATION, PERMISSION_STATUS.DENIED);
        resolve(PERMISSION_STATUS.DENIED);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.permissions.set(PERMISSION_TYPES.LOCATION, PERMISSION_STATUS.GRANTED);
          resolve(PERMISSION_STATUS.GRANTED);
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            this.permissions.set(PERMISSION_TYPES.LOCATION, PERMISSION_STATUS.DENIED);
          }
          resolve(this.permissions.get(PERMISSION_TYPES.LOCATION) || PERMISSION_STATUS.PROMPT);
        }
      );
    });
  }

  /**
   * Check and request notification permission
   */
  async requestNotifications() {
    try {
      if (!("Notification" in window)) {
        this.permissions.set(PERMISSION_TYPES.NOTIFICATIONS, PERMISSION_STATUS.DENIED);
        return PERMISSION_STATUS.DENIED;
      }

      if (Notification.permission === PERMISSION_STATUS.GRANTED) {
        this.permissions.set(PERMISSION_TYPES.NOTIFICATIONS, PERMISSION_STATUS.GRANTED);
        return PERMISSION_STATUS.GRANTED;
      }

      const permission = await Notification.requestPermission();
      this.permissions.set(PERMISSION_TYPES.NOTIFICATIONS, permission);
      return permission;
    } catch (error) {
      console.error("Notification permission error:", error);
      return PERMISSION_STATUS.DENIED;
    }
  }

  /**
   * Request all critical permissions
   */
  async requestAllPermissions() {
    const results = {};

    const [camera, microphone, location, notifications] = await Promise.all([
      this.requestCamera(),
      this.requestMicrophone(),
      this.requestLocation(),
      this.requestNotifications(),
    ]);

    results[PERMISSION_TYPES.CAMERA] = camera;
    results[PERMISSION_TYPES.MICROPHONE] = microphone;
    results[PERMISSION_TYPES.LOCATION] = location;
    results[PERMISSION_TYPES.NOTIFICATIONS] = notifications;

    return results;
  }

  /**
   * Get permission status
   */
  getPermission(type) {
    return this.permissions.get(type) || PERMISSION_STATUS.PROMPT;
  }

  /**
   * Get all permissions status
   */
  getAllPermissions() {
    return Object.fromEntries(this.permissions);
  }

  /**
   * Check if all critical permissions are granted
   */
  isReadyForRecording() {
    const camera = this.getPermission(PERMISSION_TYPES.CAMERA);
    const microphone = this.getPermission(PERMISSION_TYPES.MICROPHONE);
    return camera === PERMISSION_STATUS.GRANTED || microphone === PERMISSION_STATUS.GRANTED;
  }

  /**
   * Check if location is available
   */
  isLocationAvailable() {
    return this.getPermission(PERMISSION_TYPES.LOCATION) === PERMISSION_STATUS.GRANTED;
  }
}

export const permissionHandler = new PermissionHandler();
