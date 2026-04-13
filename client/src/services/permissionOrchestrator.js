/**
 * Permission Orchestrator Service
 * Unified permission management for all device resources with fallback strategies
 * Provides clear, transparent permission requests and status tracking
 */

export const PERMISSION_STATUS = {
  PROMPT: "prompt", // Not yet requested
  GRANTED: "granted", // User approved
  DENIED: "denied", // User rejected
  UNAVAILABLE: "unavailable", // Not supported
};

export const PERMISSION_TYPES = {
  CAMERA: "camera",
  MICROPHONE: "microphone",
  LOCATION: "location",
  NOTIFICATIONS: "notifications",
};

export const PERMISSION_EXPLANATIONS = {
  camera:
    "Camera access allows recording video evidence and live streaming. You can disable this anytime.",
  microphone:
    "Microphone access captures audio for emergency communication and evidence. You can disable this anytime.",
  location:
    "Location access enables real-time GPS tracking for emergency responders to locate you quickly.",
  notifications:
    "Notifications alert you and emergency contacts about your emergency status.",
};

/**
 * Permission Orchestrator - Unified permission management
 */
class PermissionOrchestrator {
  constructor() {
    this.permissions = new Map();
    this.permissionDenialReasons = new Map();
    this.lastRequestTime = new Map();
    this.requestCooldown = 3000; // 3 seconds between requests
    this.statusHandlers = [];
    this.denialHandlers = [];
  }

  /**
   * Initialize and check all permissions
   */
  async initialize() {
    try {
      // Check support
      this._checkSupport();

      // Check current permission states
      await this._checkPermissionStates();

      return {
        success: true,
        permissions: Object.fromEntries(this.permissions),
      };
    } catch (error) {
      console.error("Permission initialization failed:", error);
      throw error;
    }
  }

  /**
   * Check browser support for permission types
   */
  _checkSupport() {
    // Camera support
    if (!navigator.mediaDevices?.getUserMedia) {
      this.permissions.set(
        PERMISSION_TYPES.CAMERA,
        PERMISSION_STATUS.UNAVAILABLE
      );
    }

    // Microphone support
    if (!navigator.mediaDevices?.getUserMedia) {
      this.permissions.set(
        PERMISSION_TYPES.MICROPHONE,
        PERMISSION_STATUS.UNAVAILABLE
      );
    }

    // Location support
    if (!navigator.geolocation) {
      this.permissions.set(
        PERMISSION_TYPES.LOCATION,
        PERMISSION_STATUS.UNAVAILABLE
      );
    }

    // Notifications support
    if (!("Notification" in window)) {
      this.permissions.set(
        PERMISSION_TYPES.NOTIFICATIONS,
        PERMISSION_STATUS.UNAVAILABLE
      );
    }

    // Initialize to PROMPT if not already set
    for (const type of Object.values(PERMISSION_TYPES)) {
      if (!this.permissions.has(type)) {
        this.permissions.set(type, PERMISSION_STATUS.PROMPT);
      }
    }
  }

  /**
   * Check current permission states using Permissions API
   */
  async _checkPermissionStates() {
    try {
      if (!navigator.permissions?.query) {
        // Fallback: Permissions API not available
        return;
      }

      const permissionQueries = [
        { name: "camera" },
        { name: "microphone" },
        { name: "geolocation" },
      ];

      for (const query of permissionQueries) {
        try {
          const result = await navigator.permissions.query(query);
          const typeMap = {
            camera: PERMISSION_TYPES.CAMERA,
            microphone: PERMISSION_TYPES.MICROPHONE,
            geolocation: PERMISSION_TYPES.LOCATION,
          };

          if (typeMap[query.name]) {
            // Map browser permission state to our status
            const status =
              result.state === "prompt"
                ? PERMISSION_STATUS.PROMPT
                : result.state === "granted"
                  ? PERMISSION_STATUS.GRANTED
                  : result.state === "denied"
                    ? PERMISSION_STATUS.DENIED
                    : PERMISSION_STATUS.UNAVAILABLE;

            this.permissions.set(typeMap[query.name], status);

            // Listen for permission changes
            result.addEventListener("change", () => {
              this._updatePermissionState(
                typeMap[query.name],
                result.state
              );
            });
          }
        } catch (err) {
          console.warn(`Could not query ${query.name} permission:`, err);
        }
      }
    } catch (error) {
      console.error("Permission state check failed:", error);
    }
  }

  /**
   * Update permission state when changed
   */
  _updatePermissionState(type, state) {
    const newStatus =
      state === "granted"
        ? PERMISSION_STATUS.GRANTED
        : state === "denied"
          ? PERMISSION_STATUS.DENIED
          : PERMISSION_STATUS.PROMPT;

    this.permissions.set(type, newStatus);
    this._notifyStatusChange(type, newStatus);
  }

  /**
   * Request camera permission
   */
  async requestCamera(showPrompt = true) {
    return this._requestPermission(
      PERMISSION_TYPES.CAMERA,
      async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          });
          stream.getTracks().forEach((track) => track.stop());
          return PERMISSION_STATUS.GRANTED;
        } catch (error) {
          if (error.name === "NotAllowedError") {
            return PERMISSION_STATUS.DENIED;
          }
          throw error;
        }
      },
      showPrompt
    );
  }

  /**
   * Request microphone permission
   */
  async requestMicrophone(showPrompt = true) {
    return this._requestPermission(
      PERMISSION_TYPES.MICROPHONE,
      async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          stream.getTracks().forEach((track) => track.stop());
          return PERMISSION_STATUS.GRANTED;
        } catch (error) {
          if (error.name === "NotAllowedError") {
            return PERMISSION_STATUS.DENIED;
          }
          throw error;
        }
      },
      showPrompt
    );
  }

  /**
   * Request location permission
   */
  async requestLocation(showPrompt = true) {
    return this._requestPermission(
      PERMISSION_TYPES.LOCATION,
      () => {
        return new Promise((resolve) => {
          if (!navigator.geolocation) {
            resolve(PERMISSION_STATUS.UNAVAILABLE);
            return;
          }

          navigator.geolocation.getCurrentPosition(
            () => resolve(PERMISSION_STATUS.GRANTED),
            (error) => {
              if (error.code === error.PERMISSION_DENIED) {
                resolve(PERMISSION_STATUS.DENIED);
              } else {
                resolve(PERMISSION_STATUS.PROMPT);
              }
            },
            { timeout: 5000 }
          );
        });
      },
      showPrompt
    );
  }

  /**
   * Request notification permission
   */
  async requestNotifications(showPrompt = true) {
    return this._requestPermission(
      PERMISSION_TYPES.NOTIFICATIONS,
      async () => {
        if (!("Notification" in window)) {
          return PERMISSION_STATUS.UNAVAILABLE;
        }

        if (Notification.permission === "granted") {
          return PERMISSION_STATUS.GRANTED;
        }

        if (Notification.permission !== "prompt") {
          return PERMISSION_STATUS.DENIED;
        }

        const permission = await Notification.requestPermission();
        return permission === "granted"
          ? PERMISSION_STATUS.GRANTED
          : PERMISSION_STATUS.DENIED;
      },
      showPrompt
    );
  }

  /**
   * Internal permission request handler with cooldown and denial tracking
   */
  async _requestPermission(type, requestFn, showPrompt = true) {
    try {
      // Check support
      if (this.permissions.get(type) === PERMISSION_STATUS.UNAVAILABLE) {
        return PERMISSION_STATUS.UNAVAILABLE;
      }

      // Check already granted
      if (this.permissions.get(type) === PERMISSION_STATUS.GRANTED) {
        return PERMISSION_STATUS.GRANTED;
      }

      // Check cooldown (avoid rapid repeated requests)
      const lastRequest = this.lastRequestTime.get(type);
      if (lastRequest && Date.now() - lastRequest < this.requestCooldown) {
        return this.permissions.get(type);
      }

      this.lastRequestTime.set(type, Date.now());

      // Request permission
      const status = await requestFn();
      this.permissions.set(type, status);

      // Track denials
      if (status === PERMISSION_STATUS.DENIED) {
        this.permissionDenialReasons.set(type, {
          deniedAt: new Date(),
          requestCount: (this.permissionDenialReasons.get(type)?.requestCount || 0) + 1,
        });
        this._notifyDenial(type);
      }

      this._notifyStatusChange(type, status);
      return status;
    } catch (error) {
      console.error(`Failed to request ${type} permission:`, error);
      throw error;
    }
  }

  /**
   * Request all permissions at once
   */
  async requestAllPermissions() {
    const results = {
      [PERMISSION_TYPES.CAMERA]: await this.requestCamera(),
      [PERMISSION_TYPES.MICROPHONE]: await this.requestMicrophone(),
      [PERMISSION_TYPES.LOCATION]: await this.requestLocation(),
      [PERMISSION_TYPES.NOTIFICATIONS]: await this.requestNotifications(),
    };
    return results;
  }

  /**
   * Get all permission statuses
   */
  getPermissionStatus(type = null) {
    if (type) {
      return this.permissions.get(type) || PERMISSION_STATUS.UNAVAILABLE;
    }
    return Object.fromEntries(this.permissions);
  }

  /**
   * Check if all required permissions are granted
   */
  areAllPermissionsGranted() {
    for (const status of this.permissions.values()) {
      if (
        status !== PERMISSION_STATUS.GRANTED &&
        status !== PERMISSION_STATUS.UNAVAILABLE
      ) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get permissions needed for recording
   */
  getRecordingPermissionsStatus() {
    return {
      camera: this.permissions.get(PERMISSION_TYPES.CAMERA),
      microphone: this.permissions.get(PERMISSION_TYPES.MICROPHONE),
      location: this.permissions.get(PERMISSION_TYPES.LOCATION),
      ready:
        this.permissions.get(PERMISSION_TYPES.MICROPHONE) ===
          PERMISSION_STATUS.GRANTED ||
        this.permissions.get(PERMISSION_TYPES.CAMERA) ===
          PERMISSION_STATUS.GRANTED,
    };
  }

  /**
   * Get explanation for permission type
   */
  getPermissionExplanation(type) {
    return PERMISSION_EXPLANATIONS[type] || "Permission required for emergency operations.";
  }

  /**
   * Check if permission can be re-requested
   */
  canRequestPermission(type) {
    const status = this.permissions.get(type);
    if (status === PERMISSION_STATUS.GRANTED) {
      return false; // Already granted
    }
    if (status === PERMISSION_STATUS.UNAVAILABLE) {
      return false; // Not supported
    }

    // Check denial count
    const denial = this.permissionDenialReasons.get(type);
    if (denial && denial.requestCount > 3) {
      return false; // Too many denials
    }

    return true;
  }

  /**
   * Get permission denial history
   */
  getDenialHistory(type) {
    return this.permissionDenialReasons.get(type) || null;
  }

  /**
   * Register status change handler
   */
  onStatusChange(handler) {
    this.statusHandlers.push(handler);
  }

  /**
   * Register denial handler
   */
  onDenial(handler) {
    this.denialHandlers.push(handler);
  }

  /**
   * Notify status change handlers
   */
  _notifyStatusChange(type, status) {
    this.statusHandlers.forEach((handler) => {
      try {
        handler({
          type,
          status,
          timestamp: new Date(),
          explanation: this.getPermissionExplanation(type),
        });
      } catch (err) {
        console.error("Status handler failed:", err);
      }
    });
  }

  /**
   * Notify denial handlers
   */
  _notifyDenial(type) {
    const denial = this.permissionDenialReasons.get(type);
    this.denialHandlers.forEach((handler) => {
      try {
        handler({
          type,
          explanation: this.getPermissionExplanation(type),
          denialCount: denial?.requestCount || 1,
          timestamp: new Date(),
        });
      } catch (err) {
        console.error("Denial handler failed:", err);
      }
    });
  }

  /**
   * Get browser-specific fallback options
   */
  getFallbackOptions(type) {
    const ua = navigator.userAgent.toLowerCase();
    const fallbacks = {
      camera: [],
      microphone: [],
      location: [],
      notifications: [],
    };

    if (ua.includes("firefox")) {
      return fallbacks; // Firefox generally supports all APIs
    }

    if (ua.includes("safari")) {
      // Safari limitations
      fallbacks.camera = ["Use device's built-in recording app"];
      fallbacks.microphone = ["Use device's voice recorder"];
      fallbacks.location = ["Enable location in Privacy settings"];
    }

    if (ua.includes("android")) {
      // Android-specific
      fallbacks.notifications = ["Enable in Android Settings > Apps"];
    }

    return fallbacks[type] || [];
  }
}

// Singleton instance
export const permissionOrchestrator = new PermissionOrchestrator();
