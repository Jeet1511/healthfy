/**
 * Recording Indicator Component
 * Persistent visual indicator showing recording status
 * WCAG 2.1 accessible with clear status communication
 */

import React from "react";
import { motion } from "framer-motion";
import "./RecordingIndicator.css";

function RecordingIndicator({
  isRecording = false,
  recordingTime = 0,
  formatTime = (s) => s.toString().padStart(2, "0"),
  sessionId = null,
}) {
  const pulseVariants = {
    pulse: {
      scale: [1, 1.1, 1],
      transition: { duration: 1, repeat: Infinity },
    },
  };

  const blinkVariants = {
    blink: {
      opacity: [1, 0, 1],
      transition: { duration: 1, repeat: Infinity },
    },
  };

  if (!isRecording) {
    return null;
  }

  return (
    <motion.div
      className="recording-indicator"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      role="status"
      aria-live="polite"
      aria-label={`Recording active for ${formatTime(recordingTime)}`}
    >
      <div className="indicator-content">
        {/* Recording Dot */}
        <motion.div
          className="recording-dot"
          variants={blinkVariants}
          animate="blink"
          aria-hidden="true"
        />

        {/* Status Text */}
        <div className="indicator-text">
          <span className="status-label">🔴 RECORDING</span>
          <span className="recording-time" aria-label="Recording duration">
            {formatTime(recordingTime)}
          </span>
        </div>

        {/* Session ID (if available) */}
        {sessionId && (
          <div className="session-badge" title={sessionId}>
            <span className="badge-label">Session:</span>
            <code className="session-id">{sessionId.substring(0, 12)}...</code>
          </div>
        )}

        {/* Safety Info */}
        <div className="safety-info">
          <span className="safety-icon">🔒</span>
          <span className="safety-text">
            Recording • Location Tracking • Permissions Clear
          </span>
        </div>
      </div>

      {/* Visual Indicator Bar */}
      <div className="indicator-bar" aria-hidden="true">
        <motion.div
          className="bar-pulse"
          variants={pulseVariants}
          animate="pulse"
        />
      </div>
    </motion.div>
  );
}

export default RecordingIndicator;
