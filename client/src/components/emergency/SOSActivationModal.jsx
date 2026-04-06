import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useEmergency } from '../../context/EmergencyContext';
import './SOSActivationModal.css';

const SOSActivationModal = ({ isOpen, onClose }) => {
  const { sosStatus, SOS_STATUS, emergency, cancelSOS } = useEmergency();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [statusItems] = useState({
    recording: { label: 'Recording Started', icon: CheckCircle },
    tracking: { label: 'Location Shared', icon: CheckCircle },
    alertSent: { label: 'Alert Sent', icon: CheckCircle },
  });

  useEffect(() => {
    if (!isOpen || sosStatus !== SOS_STATUS.ACTIVE) return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, sosStatus, SOS_STATUS]);

  useEffect(() => {
    if (!isOpen) {
      setElapsedTime(0);
    }
  }, [isOpen]);

  if (!isOpen || sosStatus !== SOS_STATUS.ACTIVE) {
    return null;
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isRecording = emergency?.isRecording || false;
  const isTracking = emergency?.isTracking || false;

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
            Emergency services have been notified. Your location is being shared.
          </p>

          <div className="sos-timer">
            <Clock size={20} />
            <span className="timer-display">{formatTime(elapsedTime)}</span>
          </div>

          <div className="sos-status-list">
            {statusItems.recording.label && (
              <div className={`status-item ${isRecording ? 'active' : 'pending'}`}>
                <CheckCircle size={20} className="status-icon" />
                <span className="status-label">{statusItems.recording.label}</span>
                {isRecording && <div className="status-indicator" />}
              </div>
            )}

            {statusItems.tracking.label && (
              <div className={`status-item ${isTracking ? 'active' : 'pending'}`}>
                <CheckCircle size={20} className="status-icon" />
                <span className="status-label">{statusItems.tracking.label}</span>
                {isTracking && <div className="status-indicator" />}
              </div>
            )}

            {statusItems.alertSent.label && (
              <div className="status-item active">
                <CheckCircle size={20} className="status-icon" />
                <span className="status-label">{statusItems.alertSent.label}</span>
                <div className="status-indicator" />
              </div>
            )}
          </div>

          <div className="sos-emergency-contacts">
            <h4>Emergency Contacts Notified</h4>
            <p className="contacts-info">
              {emergency?.emergencyContacts?.length || 0} contact(s) have been notified with your location.
            </p>
          </div>
        </div>

        <div className="sos-modal-footer">
          <button className="btn-cancel" onClick={cancelSOS}>
            Cancel SOS
          </button>
          <button className="btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SOSActivationModal;
