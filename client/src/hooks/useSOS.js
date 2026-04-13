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
  const [sosHandler, setSosHandler] = useState(null);

  const holdStartTime = useRef(null);
  const holdInterval = useRef(null);
  const holdTimer = useRef(null);

  // Initialize SOS handler
  useEffect(() => {
    const handler = createSOSHandler(context);
    setSosHandler(handler);

    return () => {
      if (handler.locationWatchId !== null) {
        handler.deactivate();
      }
    };
  }, [context]);

  // Handle button press (hold to activate)
  const handleMouseDown = useCallback(() => {
    if (context.sosStatus !== SOS_STATUS.ARMED) return;

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
        handleTrigger();
      }
    }, 50);
  }, [context.sosStatus]);

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
    if (!sosHandler || context.sosStatus === SOS_STATUS.TRIGGERED) return;

    await sosHandler.trigger();
  }, [sosHandler, context.sosStatus]);

  // Deactivate SOS
  const handleDeactivate = useCallback(async () => {
    if (!sosHandler) return;

    await sosHandler.deactivate();
    context.enterDailyMode();
  }, [sosHandler, context]);

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
          context.addStatusLog(`🎙️ Voice command detected: "${transcript}"`, "info");
          handleTrigger();
          break;
        }
      }
    };

    recognition.start();

    return () => {
      recognition.stop();
    };
  }, [context.voiceCommandActive, handleTrigger, context]);

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
    sosHandler,
    summary: sosHandler?.getSummary(),
  };
}
