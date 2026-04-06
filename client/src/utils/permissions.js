/**
 * Permission handling utility
 * Manages browser permissions for location, microphone, camera, notifications
 */

export const PERMISSION_STATUS = {
  GRANTED: "granted",
  DENIED: "denied",
  PROMPT: "prompt",
  UNAVAILABLE: "unavailable",
};

export const PERMISSIONS = {
  LOCATION: "geolocation",
  MICROPHONE: "microphone",
  CAMERA: "camera",
  NOTIFICATIONS: "notifications",
};

/**
 * Check if a permission is available and get its status
 */
export async function checkPermission(permission) {
  try {
    switch (permission) {
      case PERMISSIONS.LOCATION:
        return checkGeolocationPermission();
      case PERMISSIONS.MICROPHONE:
        return await checkMicrophonePermission();
      case PERMISSIONS.CAMERA:
        return await checkCameraPermission();
      case PERMISSIONS.NOTIFICATIONS:
        return checkNotificationPermission();
      default:
        return PERMISSION_STATUS.UNAVAILABLE;
    }
  } catch (error) {
    console.error(`Error checking ${permission} permission:`, error);
    return PERMISSION_STATUS.UNAVAILABLE;
  }
}

/**
 * Request a permission
 */
export async function requestPermission(permission) {
  try {
    switch (permission) {
      case PERMISSIONS.LOCATION:
        return await requestGeolocationPermission();
      case PERMISSIONS.MICROPHONE:
        return await requestMicrophonePermission();
      case PERMISSIONS.CAMERA:
        return await requestCameraPermission();
      case PERMISSIONS.NOTIFICATIONS:
        return await requestNotificationPermission();
      default:
        return PERMISSION_STATUS.UNAVAILABLE;
    }
  } catch (error) {
    console.error(`Error requesting ${permission} permission:`, error);
    return PERMISSION_STATUS.DENIED;
  }
}

/**
 * Geolocation permission check
 */
function checkGeolocationPermission() {
  if (!navigator.geolocation) {
    return PERMISSION_STATUS.UNAVAILABLE;
  }
  
  // For geolocation, we can only know the status after trying to get location
  // Return PROMPT as default
  return PERMISSION_STATUS.PROMPT;
}

/**
 * Request geolocation permission
 */
async function requestGeolocationPermission() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(PERMISSION_STATUS.UNAVAILABLE);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => resolve(PERMISSION_STATUS.GRANTED),
      (error) => {
        // error.code 1 = denied
        if (error.code === 1) {
          resolve(PERMISSION_STATUS.DENIED);
        } else {
          resolve(PERMISSION_STATUS.UNAVAILABLE);
        }
      },
      { timeout: 5000 }
    );
  });
}

/**
 * Microphone permission check
 */
async function checkMicrophonePermission() {
  if (!navigator.permissions) {
    return PERMISSION_STATUS.UNAVAILABLE;
  }

  try {
    const result = await navigator.permissions.query({ name: "microphone" });
    return result.state;
  } catch (error) {
    return PERMISSION_STATUS.UNAVAILABLE;
  }
}

/**
 * Request microphone permission
 */
async function requestMicrophonePermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop the stream immediately after getting permission
    stream.getTracks().forEach((track) => track.stop());
    return PERMISSION_STATUS.GRANTED;
  } catch (error) {
    if (error.name === "NotAllowedError") {
      return PERMISSION_STATUS.DENIED;
    }
    return PERMISSION_STATUS.UNAVAILABLE;
  }
}

/**
 * Camera permission check
 */
async function checkCameraPermission() {
  if (!navigator.permissions) {
    return PERMISSION_STATUS.UNAVAILABLE;
  }

  try {
    const result = await navigator.permissions.query({ name: "camera" });
    return result.state;
  } catch (error) {
    return PERMISSION_STATUS.UNAVAILABLE;
  }
}

/**
 * Request camera permission
 */
async function requestCameraPermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // Stop the stream immediately after getting permission
    stream.getTracks().forEach((track) => track.stop());
    return PERMISSION_STATUS.GRANTED;
  } catch (error) {
    if (error.name === "NotAllowedError") {
      return PERMISSION_STATUS.DENIED;
    }
    return PERMISSION_STATUS.UNAVAILABLE;
  }
}

/**
 * Notification permission check
 */
function checkNotificationPermission() {
  if (!("Notification" in window)) {
    return PERMISSION_STATUS.UNAVAILABLE;
  }
  return Notification.permission;
}

/**
 * Request notification permission
 */
async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    return PERMISSION_STATUS.UNAVAILABLE;
  }

  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Get device capabilities
 */
export function getDeviceCapabilities() {
  return {
    hasGeolocation: !!navigator.geolocation,
    hasMediaDevices: !!navigator.mediaDevices?.getUserMedia,
    hasNotifications: "Notification" in window,
    hasVibration: !!navigator.vibrate,
    hasDeviceMotion: !!window.DeviceMotionEvent,
    hasScreenSharing: !!(navigator.mediaDevices?.getDisplayMedia || navigator.getDisplayMedia),
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ),
  };
}

/**
 * Check if device supports shake detection
 */
export function supportsShakeDetection() {
  return !!window.DeviceMotionEvent;
}

/**
 * Request all critical permissions
 */
export async function requestAllCriticalPermissions() {
  const permissions = {
    location: await requestPermission(PERMISSIONS.LOCATION),
    microphone: await requestPermission(PERMISSIONS.MICROPHONE),
    camera: await requestPermission(PERMISSIONS.CAMERA),
    notifications: await requestPermission(PERMISSIONS.NOTIFICATIONS),
  };

  return permissions;
}
