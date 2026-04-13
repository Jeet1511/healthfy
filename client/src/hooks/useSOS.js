/**
 * useSOS hook
 * Manages SOS state and triggers with hold detection
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { useEmergency, SOS_STATUS } from "@/context/EmergencyContext";
import { createSOSHandler } from "@/services/sosService";

const HOLD_DURATION = 3000; // 3 seconds to trigger

export function useSOS() {
  const context = useEmergency();
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);

  const contextRef = useRef(context);
  const contextProxyRef = useRef(null);
  const sosHandlerRef = useRef(null);
  const holdStartTime = useRef(null);
  const holdInterval = useRef(null);

  useEffect(() => {
    contextRef.current = context;
  }, [context]);

  // Initialize SOS handler
  useEffect(() => {
    if (!contextProxyRef.current) {
      contextProxyRef.current = new Proxy(
        {},
        {
          get(_, prop) {
            return contextRef.current[prop];
          },
        }
      );
    }

    const handler = createSOSHandler(contextProxyRef.current);
    sosHandlerRef.current = handler;

    return () => {
      if (handler.locationWatchId !== null) {
        handler.deactivate();
      }
      if (typeof handler.destroy === "function") {
        handler.destroy();
      }
    };
  }, []);

  const triggerWithSource = useCallback(async (source) => {
    const currentStatus = contextRef.current.sosStatus;
    if (
      !sosHandlerRef.current ||
      currentStatus === SOS_STATUS.TRIGGERED ||
      currentStatus === SOS_STATUS.RECORDING
    ) {
      return;
    }

    if (navigator.vibrate) {
      navigator.vibrate([80, 40, 120]);
    }

    await sosHandlerRef.current.trigger({ triggerSource: source });
  }, []);

  // Handle button press (hold to activate)
  const handleMouseDown = useCallback(() => {
    const currentStatus = contextRef.current.sosStatus;
    if (
      currentStatus === SOS_STATUS.COOLDOWN ||
      currentStatus === SOS_STATUS.TRIGGERED ||
      currentStatus === SOS_STATUS.RECORDING
    ) {
      return;
    }

    if (navigator.vibrate) {
      navigator.vibrate(20);
    }

    holdStartTime.current = Date.now();
    setIsHolding(true);
    setHoldProgress(0);

    // Update progress every 50ms
    holdInterval.current = setInterval(() => {
      const elapsed = Date.now() - holdStartTime.current;
      const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setHoldProgress(progress);

      if (elapsed >= HOLD_DURATION) {
        clearInterval(holdInterval.current);
        // Auto-trigger when hold duration reached
        triggerWithSource("hold-button");
      }
    }, 50);
  }, [triggerWithSource]);

  // Handle release
  const handleMouseUp = useCallback(() => {
    if (holdInterval.current) {
      clearInterval(holdInterval.current);
    }
    setIsHolding(false);
    setHoldProgress(0);
    holdStartTime.current = null;
  }, []);

  // Touch support
  const handleTouchStart = handleMouseDown;
  const handleTouchEnd = handleMouseUp;

  // Trigger SOS
  const handleTrigger = useCallback(async () => {
    await triggerWithSource("manual-trigger");
  }, [triggerWithSource]);

  // Deactivate SOS
  const handleDeactivate = useCallback(async () => {
    if (!sosHandlerRef.current) return;

    await sosHandlerRef.current.deactivate();
    contextRef.current.enterDailyMode();
  }, []);

  // Voice command trigger (if Web Speech API available)
  useEffect(() => {
    if (!context.voiceCommandActive || typeof window === "undefined") return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase();

        // Check for voice activation words
        if (
          transcript.includes("help") ||
          transcript.includes("sos") ||
          transcript.includes("emergency") ||
          transcript.includes("save me")
        ) {
          contextRef.current.addStatusLog(`🎙️ Voice command detected: "${transcript}"`, "info");
          triggerWithSource("voice-command");
          break;
        }
      }
    };

    recognition.start();

    return () => {
      recognition.stop();
    };
  }, [context.voiceCommandActive, triggerWithSource]);

  // Motion trigger: detect shake to activate SOS.
  useEffect(() => {
    if (typeof window === "undefined" || !window.DeviceMotionEvent) {
      return;
    }

    let last = { x: null, y: null, z: null };
    let lastShakeAt = 0;

    const handleMotion = (event) => {
      const currentStatus = contextRef.current.sosStatus;
      if (
        currentStatus === SOS_STATUS.COOLDOWN ||
        currentStatus === SOS_STATUS.TRIGGERED ||
        currentStatus === SOS_STATUS.RECORDING
      ) {
        return;
      }

      const accel = event.accelerationIncludingGravity;
      if (!accel) {
        return;
      }

      if (last.x === null) {
        last = { x: accel.x, y: accel.y, z: accel.z };
        return;
      }

      const deltaX = Math.abs((accel.x || 0) - (last.x || 0));
      const deltaY = Math.abs((accel.y || 0) - (last.y || 0));
      const deltaZ = Math.abs((accel.z || 0) - (last.z || 0));

      last = { x: accel.x, y: accel.y, z: accel.z };

      const shakeStrength = deltaX + deltaY + deltaZ;
      const now = Date.now();
      if (shakeStrength > 28 && now - lastShakeAt > 2500) {
        lastShakeAt = now;
        contextRef.current.addStatusLog("Motion trigger detected (device shake)", "warning");
        triggerWithSource("motion-shake");
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => {
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [triggerWithSource]);

  return {
    // State
    isHolding,
    holdProgress,
    sosStatus: context.sosStatus,
    isRecordingAudio: context.isRecordingAudio,
    isRecordingVideo: context.isRecordingVideo,
    location: context.location,
    statusLogs: context.statusLogs,

    // Handlers
    handleMouseDown,
    handleMouseUp,
    handleTouchStart,
    handleTouchEnd,
    handleTrigger,
    handleDeactivate,

    // Data
    sosHandler: sosHandlerRef.current,
    summary: sosHandlerRef.current?.getSummary(),
  };
}
