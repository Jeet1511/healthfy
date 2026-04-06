/**
 * StatusIndicatorsPanel.jsx
 * Real-time display of system status
 */

import { useEmergency, SOS_STATUS } from "@/context/EmergencyContext";
import { Mic, MapPin, Video, AlertCircle } from "lucide-react";
import "./StatusIndicatorsPanel.css";

export default function StatusIndicatorsPanel() {
  const { sosStatus, isRecordingAudio, isRecordingVideo, location, statusLogs } = useEmergency();

  const isActive = sosStatus === SOS_STATUS.TRIGGERED || sosStatus === SOS_STATUS.RECORDING;

  const indicators = [
    {
      label: "Audio Recording",
      icon: Mic,
      active: isRecordingAudio && isActive,
      color: "red",
    },
    {
      label: "Location Tracking",
      icon: MapPin,
      active: isActive && !!location,
      color: "blue",
    },
    {
      label: "Video Recording",
      icon: Video,
      active: isRecordingVideo && isActive,
      color: "purple",
    },
  ];

  return (
    <section className="status-panel card">
      <h3 className="title" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
        <AlertCircle size={20} />
        System Status
      </h3>

      <div className="indicators-grid">
        {indicators.map((indicator) => {
          const Icon = indicator.icon;
          return (
            <div key={indicator.label} className={`status-indicator ${indicator.color} ${indicator.active ? "active" : ""}`}>
              <div className="indicator-dot"></div>
              <Icon size={18} />
              <span className="indicator-label">{indicator.label}</span>
              <span className="indicator-status">{indicator.active ? "ON" : "OFF"}</span>
            </div>
          );
        })}
      </div>

      <div className="status-summary">
        <p>
          <strong>Mode:</strong>{" "}
          <span style={{ color: isActive ? "#dc2626" : "#666" }}>
            {isActive ? "🚨 EMERGENCY ACTIVE" : "✓ Ready"}
          </span>
        </p>
        {isActive && location && (
          <p>
            <strong>Location:</strong> {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </p>
        )}
        {isActive && statusLogs.length > 0 && (
          <p>
            <strong>Last Update:</strong> {new Date(statusLogs[0].timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </section>
  );
}
