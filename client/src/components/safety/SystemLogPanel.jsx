/**
 * SystemLogPanel.jsx
 * Display real-time emergency system logs
 */

import { useEmergency } from "@/context/EmergencyContext";
import { Activity } from "lucide-react";
import "./SystemLogPanel.css";

export default function SystemLogPanel() {
  const { statusLogs } = useEmergency();

  const getLogIcon = (type) => {
    const icons = {
      info: "ℹ️",
      success: "✓",
      warning: "⚠️",
      error: "✕",
      sos_trigger: "🚨",
      recording_started: "🎙️",
      location_shared: "📍",
    };
    return icons[type] || "•";
  };

  return (
    <section className="system-log-panel card">
      <h3 className="title" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
        <Activity size={20} />
        System Log
      </h3>

      <div className="logs-container">
        {statusLogs.length === 0 ? (
          <div className="no-logs">
            <p>No system activity yet.</p>
          </div>
        ) : (
          statusLogs.slice(0, 15).map((log, index) => (
            <div key={log.id || index} className={`log-entry log-${log.type}`}>
              <div className="log-time">
                {new Date(log.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </div>
              <div className="log-icon">{getLogIcon(log.type)}</div>
              <div className="log-message">{log.message}</div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
