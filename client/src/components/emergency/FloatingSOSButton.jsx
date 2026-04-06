/**
 * FloatingSOSButton.jsx
 * Minimal floating SOS button with hold-to-activate functionality
 */

import { useState, useRef, useCallback } from "react";
import { AlertTriangle } from "lucide-react";
import { useEmergency, SOS_STATUS } from "@/context/EmergencyContext";
import { useSOS } from "@/hooks/useSOS";
import "./FloatingSOSButton.css";

export default function FloatingSOSButton() {
  const { sosStatus } = useEmergency();
  const {
    isHolding,
    holdProgress,
    handleMouseDown,
    handleMouseUp,
    handleTouchStart,
    handleTouchEnd,
  } = useSOS();

  const isActive = sosStatus === SOS_STATUS.TRIGGERED || sosStatus === SOS_STATUS.RECORDING;

  return (
    <button
      className={`floating-sos-button ${isHolding ? "holding" : ""} ${isActive ? "active" : ""}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      disabled={sosStatus === SOS_STATUS.COOLDOWN}
      title="Press and hold for 3 seconds to activate SOS"
    >
      {/* Progress Ring (shows while holding) */}
      {isHolding && (
        <svg className="progress-ring-svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" className="progress-bg" />
          <circle
            cx="50"
            cy="50"
            r="45"
            className="progress-fill"
            style={{
              strokeDashoffset: `${(282.7 * (100 - holdProgress)) / 100}`,
            }}
          />
        </svg>
      )}

      {/* Center Icon */}
      <div className="button-content">
        <AlertTriangle size={32} className="button-icon" />
        <span className="button-text">
          {isActive ? "SOS" : "HOLD"}
        </span>
      </div>

      {/* Pulsing rings for active state */}
      {isActive && (
        <>
          <div className="pulse-ring pulse-1"></div>
          <div className="pulse-ring pulse-2"></div>
        </>
      )}
    </button>
  );
}
