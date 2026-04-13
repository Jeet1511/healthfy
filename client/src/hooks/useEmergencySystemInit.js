/**
 * Emergency System Initializer
 * Runs on app startup to set up location tracking and request permissions
 */

import { useEffect, useRef } from "react";
import { useEmergency } from "@/context/EmergencyContext";
import { getDeviceCapabilities } from "@/utils/permissions";
import { watchLocation, stopWatchingLocation } from "@/services/locationService";
import {
  permissionOrchestrator,
  PERMISSION_TYPES,
} from "@/services/permissionOrchestrator";

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

        // Sync current permission states without forcing immediate browser prompts.
        const initialization = await permissionOrchestrator.initialize();
        context.updateAllPermissions(initialization.permissions || {});

        permissionOrchestrator.onStatusChange(({ type, status }) => {
          context.updatePermission(type, status);
        });

        const current = permissionOrchestrator.getPermissionStatus();
        if (current[PERMISSION_TYPES.LOCATION] === "granted") {
          context.addStatusLog("✓ Location permission available", "success");
        }
        if (current[PERMISSION_TYPES.MICROPHONE] === "granted") {
          context.addStatusLog("✓ Microphone permission available", "success");
        }
        if (current[PERMISSION_TYPES.CAMERA] === "granted") {
          context.addStatusLog("✓ Camera permission available", "success");
        }
        if (current[PERMISSION_TYPES.NOTIFICATIONS] === "granted") {
          context.addStatusLog("✓ Notification permission available", "success");
        }

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
