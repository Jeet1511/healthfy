/**
 * useVoiceCommands hook
 * Integrates voice command processing with emergency system
 * Handles SOS, police calls, recording, and location sharing via voice
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useEmergency } from "@/context/EmergencyContext";
import { VoiceCommandProcessor } from "@/services/voiceCommandService";

export function useVoiceCommands(enabled = true) {
  const { emergencyState, dispatchEmergency, addStatusLog } = useEmergency();
  const processorRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [lastCommand, setLastCommand] = useState(null);
  const [error, setError] = useState(null);

  // Initialize voice command processor
  useEffect(() => {
    if (!enabled) return;

    const processor = new VoiceCommandProcessor({
      language: "en",
      confidenceThreshold: 0.7,
      onCommandDetected: handleCommandDetected,
      onTranscript: handleTranscript,
      onError: handleError,
    });

    processorRef.current = processor;

    // Auto-start listening when emergency mode is active
    if (emergencyState.isInEmergencyMode) {
      processor.start();
      setIsListening(true);
    }

    return () => {
      if (processor.isListening) {
        processor.stop();
      }
    };
  }, [enabled, emergencyState.isInEmergencyMode]);

  const handleTranscript = useCallback((transcriptData) => {
    setInterimTranscript(transcriptData.interim);
    setTranscript(transcriptData.final);

    // Display interim transcript in UI
    if (transcriptData.interim) {
      console.log("Hearing:", transcriptData.interim);
    }
  }, []);

  const handleError = useCallback((errorData) => {
    setError(errorData.message);
    addStatusLog({
      type: "voice_error",
      message: `Voice command error: ${errorData.message}`,
      severity: "warning",
    });
  }, [addStatusLog]);

  const handleCommandDetected = useCallback(
    (commandData) => {
      if (commandData.type === "CONFIRMATION_NEEDED") {
        // Show confirmation dialog for low-confidence commands
        addStatusLog({
          type: "voice_confirmation",
          message: `Did you mean: ${commandData.command}?`,
          severity: "info",
        });
        return;
      }

      // High-confidence command detected
      setLastCommand(commandData);
      addStatusLog({
        type: "voice_command",
        message: `Voice command detected: ${commandData.command}`,
        severity: "info",
      });

      // Dispatch action based on command
      executeVoiceCommand(commandData);
    },
    [addStatusLog]
  );

  const executeVoiceCommand = useCallback(
    (commandData) => {
      const { command, action, confidence, priority } = commandData;

      switch (action) {
        case "TRIGGER_SOS":
          dispatchEmergency({ type: "SET_SOS_STATUS", payload: "triggered" });
          addStatusLog({
            type: "sos_voice_trigger",
            message: "SOS activated via voice command",
            severity: "critical",
          });
          console.log("SOS triggered by voice - Confidence:", confidence);
          break;

        case "CALL_POLICE":
          dispatchEmergency({ type: "CALL_EMERGENCY_SERVICE", payload: "police" });
          addStatusLog({
            type: "police_call",
            message: "Police call initiated via voice command",
            severity: "high",
          });
          break;

        case "CALL_AMBULANCE":
          dispatchEmergency({ type: "CALL_EMERGENCY_SERVICE", payload: "ambulance" });
          addStatusLog({
            type: "ambulance_call",
            message: "Ambulance call initiated via voice command",
            severity: "high",
          });
          break;

        case "START_RECORDING":
          dispatchEmergency({ type: "START_RECORDING", payload: "audio" });
          addStatusLog({
            type: "recording_started",
            message: "Audio recording started via voice command",
            severity: "info",
          });
          break;

        case "STOP_RECORDING":
          dispatchEmergency({ type: "STOP_RECORDING" });
          addStatusLog({
            type: "recording_stopped",
            message: "Audio recording stopped via voice command",
            severity: "info",
          });
          break;

        case "SHARE_LOCATION":
          dispatchEmergency({ type: "SHARE_LOCATION" });
          addStatusLog({
            type: "location_shared",
            message: "Location shared via voice command",
            severity: "info",
          });
          break;

        case "SILENT_ALARM":
          dispatchEmergency({ type: "SET_SOS_STATUS", payload: "silent_alarm" });
          addStatusLog({
            type: "silent_alarm",
            message: "Silent alarm activated via voice command",
            severity: "high",
          });
          break;

        case "SHOW_HELP":
          dispatchEmergency({ type: "SHOW_HELP" });
          addStatusLog({
            type: "help_requested",
            message: "Help information displayed via voice command",
            severity: "info",
          });
          break;

        default:
          console.log("Unknown voice command action:", action);
      }

      // Haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]); // Short vibration pattern
      }
    },
    [dispatchEmergency, addStatusLog]
  );

  const startListening = useCallback(() => {
    if (processorRef.current && !isListening) {
      processorRef.current.start();
      setIsListening(true);
      setError(null);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (processorRef.current && isListening) {
      processorRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const setLanguage = useCallback((language) => {
    if (processorRef.current) {
      processorRef.current.setLanguage(language);
    }
  }, []);

  const getSupportedLanguages = useCallback(() => {
    if (processorRef.current) {
      return processorRef.current.getSupportedLanguages();
    }
    return [];
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    lastCommand,
    error,
    startListening,
    stopListening,
    toggleListening,
    setLanguage,
    getSupportedLanguages,
  };
}

export default useVoiceCommands;
