import { useState, useEffect } from "react";
import { useSOS } from "@/hooks/useSOS";
import { useEmergency, SOS_STATUS } from "@/context/EmergencyContext";
import { AlertTriangle, Mic, Video, MapPin, X } from "lucide-react";
import "./SOSPanel.css";

export default function SOSPanel() {
  const {
    isHolding,
    holdProgress,
    sosStatus,
    isRecordingAudio,
    isRecordingVideo,
    location,
    handleMouseDown,
    handleMouseUp,
    handleTouchStart,
    handleTouchEnd,
    handleTrigger,
    handleDeactivate,
    summary,
  } = useSOS();

  const context = useEmergency();
  const [elapsedTime, setElapsedTime] = useState(0);

  // Update elapsed time
  useEffect(() => {
    if (sosStatus !== SOS_STATUS.TRIGGERED) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [sosStatus]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (sosStatus === SOS_STATUS.TRIGGERED || sosStatus === SOS_STATUS.RECORDING) {
    return (
      <section className="sos-panel sos-active">
        <div className="sos-header">
          <div className="sos-status-badge">
            <AlertTriangle size={18} className="pulse" />
            <span>EMERGENCY MODE ACTIVE</span>
          </div>
          <div className="sos-timer">{formatTime(elapsedTime)}</div>
        </div>

        <div className="sos-recordings">
          {isRecordingAudio && (
            <div className="recording-indicator audio">
              <Mic size={16} className="pulse" />
              <span>Recording Audio</span>
            </div>
          )}
          {isRecordingVideo && (
            <div className="recording-indicator video">
              <Video size={16} className="pulse" />
              <span>Recording Video</span>
            </div>
          )}
        </div>

        {location && (
          <div className="sos-location">
            <MapPin size={16} />
            <div>
              <small>Live Location</small>
              <p>
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </p>
              <p className="accuracy">Accuracy: {location.accuracy?.toFixed(1)}m</p>
            </div>
          </div>
        )}

        <div className="sos-contacts">
          <h4>Contacts Notified: {context.sosMetadata.contactsNotified?.length || 0}</h4>
          {context.sosMetadata.contactsNotified?.map((contact) => (
            <span key={contact} className="contact-badge">
              ✓ {contact}
            </span>
          ))}
        </div>

        <button className="btn-deactivate" onClick={handleDeactivate}>
          <X size={20} />
          Stop Emergency
        </button>

        <div className="sos-logs">
          <h4>Status Logs</h4>
          <div className="logs-container">
            {context.statusLogs.slice(0, 10).map((log) => (
              <div key={log.id} className={`log-entry ${log.type}`}>
                <span className="timestamp">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className="message">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="sos-panel">
      <h3 className="title">🚨 Emergency SOS</h3>
      <p className="subtle">Press and hold for 3 seconds to trigger emergency alert. Voice command: "Help me"</p>

      <div className="sos-button-container">
        <button
          className={`sos-button ${isHolding ? "holding" : ""}`}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          disabled={sosStatus !== SOS_STATUS.ARMED}
        >
          <div className="sos-button-inner">
            <AlertTriangle size={40} />
            <span className="sos-text">HOLD TO SOS</span>

            {isHolding && (
              <div className="hold-progress-ring">
                <svg viewBox="0 0 100 100" className="progress-svg">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    className="progress-bg"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    className="progress-ring"
                    style={{
                      strokeDashoffset: `${(282.7 * (100 - holdProgress)) / 100}`,
                    }}
                  />
                </svg>
              </div>
            )}
          </div>

          {isHolding && (
            <div className="hold-indicator">
              <div className="hold-text">{Math.ceil(holdProgress / 33)}/3</div>
            </div>
          )}
        </button>
      </div>

      <div className="sos-features">
        <div className="feature">
          <Mic size={20} />
          <span>Auto Audio Record</span>
        </div>
        <div className="feature">
          <Video size={20} />
          <span>Auto Video Record</span>
        </div>
        <div className="feature">
          <MapPin size={20} />
          <span>Live Location</span>
        </div>
      </div>

      <div className="sos-help-text">
        <p>When activated, the system will:</p>
        <ul>
          <li>Start recording audio & video</li>
          <li>Send live location to emergency contacts</li>
          <li>Record and backup all evidence</li>
          <li>Alert nearest emergency services</li>
        </ul>
      </div>
    </section>
  );
}
