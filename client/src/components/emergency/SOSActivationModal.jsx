import { useEffect, useMemo, useState } from "react";
import { X, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { SOS_STATUS, useEmergency } from "../../context/EmergencyContext";
import "./SOSActivationModal.css";

const SOSActivationModal = ({ isOpen, onClose }) => {
  const {
    sosStatus,
    sosTriggeredAt,
    isRecordingAudio,
    isRecordingVideo,
    location,
    sosMetadata,
    cancelSOS,
  } = useEmergency();

  const [elapsedTime, setElapsedTime] = useState(0);

  const isActive =
    sosStatus === SOS_STATUS.TRIGGERED || sosStatus === SOS_STATUS.RECORDING;

  useEffect(() => {
    if (!isOpen || !isActive || !sosTriggeredAt) return;

    const tick = () => {
      const start = new Date(sosTriggeredAt).getTime();
      const now = Date.now();
      setElapsedTime(Math.max(0, Math.floor((now - start) / 1000)));
    };

    tick();
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [isActive, isOpen, sosTriggeredAt]);

  useEffect(() => {
    if (!isOpen) {
      setElapsedTime(0);
    }
  }, [isOpen]);

  const statusItems = useMemo(
    () => [
      {
        key: "recording",
        label: "Recording Started",
        active: isRecordingAudio || isRecordingVideo,
      },
      {
        key: "tracking",
        label: "Location Shared",
        active: Boolean(location),
      },
      {
        key: "alerts",
        label: "Emergency Alerts Sent",
        active: true,
      },
    ],
    [isRecordingAudio, isRecordingVideo, location]
  );

  if (!isOpen || !isActive) {
    return null;
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const contactsCount = sosMetadata?.contactsNotified?.length || 0;

  return (
    <div className="sos-modal-overlay" onClick={onClose}>
      <div className="sos-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="sos-modal-header">
          <div className="sos-modal-title">
            <div className="sos-alert-icon">
              <AlertTriangle size={32} />
            </div>
            <h2>SOS ACTIVATED</h2>
          </div>
          <button className="sos-modal-close" onClick={onClose} title="Close">
            <X size={24} />
          </button>
        </div>

        <div className="sos-modal-content">
          <p className="sos-modal-subtitle">
            Emergency mode is active. Evidence capture and location sharing are running with fallbacks.
          </p>

          <div className="sos-timer">
            <Clock size={20} />
            <span className="timer-display">{formatTime(elapsedTime)}</span>
          </div>

          <div className="sos-status-list">
            {statusItems.map((item) => (
              <div key={item.key} className={`status-item ${item.active ? "active" : "pending"}`}>
                <CheckCircle size={20} className="status-icon" />
                <span className="status-label">{item.label}</span>
                {item.active && <div className="status-indicator" />}
              </div>
            ))}
          </div>

          <div className="sos-emergency-contacts">
            <h4>Emergency Contacts Notified</h4>
            <p className="contacts-info">
              {contactsCount} contact(s) notified with your latest status and location link.
            </p>
          </div>
        </div>

        <div className="sos-modal-footer">
          <button className="btn-cancel" onClick={cancelSOS}>
            Cancel SOS
          </button>
          <button className="btn-close" onClick={onClose}>
            Keep Running
          </button>
        </div>
      </div>
    </div>
  );
};

export default SOSActivationModal;
