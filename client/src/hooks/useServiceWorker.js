/**
 * useServiceWorker hook
 * Manages service worker registration and offline functionality
 */

import { useEffect, useState } from "react";

export function useServiceWorker() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swRegistration, setSwRegistration] = useState(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check if service workers are supported
    if (!("serviceWorker" in navigator)) {
      console.log("Service Workers not supported");
      return;
    }

    // Register service worker
    registerServiceWorker();

    // Listen for online/offline events
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register("/service-worker.js", {
        scope: "/",
      });

      console.log("Service Worker registered:", registration);
      setSwRegistration(registration);

      // Check for updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setIsUpdateAvailable(true);
            console.log("New service worker version available");
          }
        });
      });

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60000); // Check every minute
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  };

  const handleOnline = () => {
    setIsOnline(true);
    console.log("App is online");
  };

  const handleOffline = () => {
    setIsOnline(false);
    console.log("App is offline - Emergency SOS still available");
  };

  const updateServiceWorker = () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    }
  };

  const clearCache = async () => {
    if (swRegistration) {
      swRegistration.active.postMessage({ type: "CLEAR_CACHE" });
      console.log("Cache cleared");
    }
  };

  return {
    isOnline,
    isUpdateAvailable,
    updateServiceWorker,
    clearCache,
    swRegistration,
  };
}

/**
 * Register periodic background sync for location checking
 */
export async function registerBackgroundSync(tag = "check-safety-zones") {
  try {
    if (!("serviceWorker" in navigator) || !("SyncManager" in window)) {
      console.log("Background Sync API not supported");
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register(tag);
    console.log("Background sync registered:", tag);
    return true;
  } catch (error) {
    console.error("Background sync registration failed:", error);
    return false;
  }
}

/**
 * Request push notification permission
 */
export async function requestPushNotificationPermission() {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.log("Push Notifications not supported");
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Push notification permission denied");
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    // In production, subscribe to push notifications
    console.log("Ready to receive push notifications");
    return true;
  } catch (error) {
    console.error("Push notification setup failed:", error);
    return false;
  }
}

export default useServiceWorker;
