/**
 * Emergency System Initializer
 * Runs on app startup to set up location tracking and request permissions
 */

import { useEffect, useRef } from "react";
import { useEmergency } from "@/context/EmergencyContext";
import { requestAllCriticalPermissions, getDeviceCapabilities } from "@/utils/permissions";
import { watchLocation, stopWatchingLocation } from "@/services/locationService";

export function useEmergencySystemInit() {
  const context = useEmergency();
  const initDoneRef = useRef(false);

  useEffect(() => {
    if (initDoneRef.current) return;
    initDoneRef.current = true;

    async function initializeEmergencySystem() {
      try {
        // Log device capabilities
        const deviceCapabilities = getDeviceCapabilities();
        console.log("Device Capabilities:", deviceCapabilities);
        context.addStatusLog("Device initialized", "info");

        // Request critical permissions (non-blocking)
        // User can allow/deny at their own pace
        requestAllCriticalPermissions()
          .then((permissions) => {
            console.log("Permissions status:", permissions);

            if (permissions.location === "granted") {
              context.updatePermission("location", "granted");
              context.addStatusLog("✓ Location permission granted", "success");
            }

            if (permissions.microphone === "granted") {
              context.updatePermission("microphone", "granted");
              context.addStatusLog("✓ Microphone permission granted", "success");
            }

            if (permissions.camera === "granted") {
              context.updatePermission("camera", "granted");
              context.addStatusLog("✓ Camera permission granted", "success");
            }

            if (permissions.notifications === "granted") {
              context.updatePermission("notifications", "granted");
              context.addStatusLog("✓ Notifications permission granted", "success");
            }
          })
          .catch((error) => {
            console.error("Error requesting permissions:", error);
          });

        // Set up background location tracking (low accuracy for battery)
        // Only starts if user is in emergency mode
        // High accuracy tracking starts when SOS is triggered
      } catch (error) {
        console.error("Error during emergency system initialization:", error);
        context.addStatusLog("⚠️ Initialization warning", "warning");
      }
    }

    initializeEmergencySystem();

    // Cleanup: Stop location watching on unmount
    return () => {
      if (context.locationWatchId !== null) {
        stopWatchingLocation(context.locationWatchId);
      }
    };
  }, [context]);
}

/**
 * Hook to maintain location accuracy based on app activity
 */
export function useLocationAccuracy() {
  const context = useEmergency();
  const watchIdRef = useRef(null);

  useEffect(() => {
    // When in emergency mode, get high-accuracy location every 3-5 seconds
    // Otherwise, get low-accuracy location periodically (if user wants)

    if (context.sosStatus === "triggered" || context.sosStatus === "recording") {
      // High accuracy during emergency
      if (context.permissions.location === "granted") {
        watchIdRef.current = watchLocation(
          (location) => {
            context.setLocation(location);
          },
          (error) => console.error("Location error:", error),
          "HIGH"
        );

        context.setLocationWatchId(watchIdRef.current);
      }

      return () => {
        if (watchIdRef.current !== null) {
          stopWatchingLocation(watchIdRef.current);
          context.setLocationWatchId(null);
        }
      };
    }
  }, [context.sosStatus, context.permissions.location, context]);
}

export default useEmergencySystemInit;
