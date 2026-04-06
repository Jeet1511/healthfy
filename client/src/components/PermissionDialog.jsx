/**
 * Permission Dialog Component
 * Clear, transparent permission request UI
 * Explains why each permission is needed for emergency response
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PERMISSION_TYPES, PERMISSION_EXPLANATIONS } from "../services/permissionOrchestrator";
import "./PermissionDialog.css";

function PermissionDialog({
  isOpen = false,
  permissionType = PERMISSION_TYPES.CAMERA,
  onGranted = null,
  onDenied = null,
}) {
  if (!isOpen) return null;

  const permissionConfig = {
    [PERMISSION_TYPES.CAMERA]: {
      icon: "📷",
      title: "Camera Permission",
      description: PERMISSION_EXPLANATIONS.camera,
      details: [
        "Record evidence video from your device camera",
        "Enables first-person documentation of the situation",
        "Data can be immediately shared with emergency responders",
      ],
    },
    [PERMISSION_TYPES.MICROPHONE]: {
      icon: "🎤",
      title: "Microphone Permission",
      description: PERMISSION_EXPLANATIONS.microphone,
      details: [
        "Capture audio for emergency communication",
        "Record ambient sound as evidence",
        "Enable voice commands if available",
      ],
    },
    [PERMISSION_TYPES.LOCATION]: {
      icon: "📍",
      title: "Location Permission",
      description: PERMISSION_EXPLANATIONS.location,
      details: [
        "Share your precise GPS coordinates with responders",
        "Enable location tracking throughout the emergency",
        "Help emergency services locate you quickly",
      ],
    },
    [PERMISSION_TYPES.NOTIFICATIONS]: {
      icon: "🔔",
      title: "Notification Permission",
      description: PERMISSION_EXPLANATIONS.notifications,
      details: [
        "Notify you of emergency response status",
        "Alert emergency contacts of your status",
        "Critical system alerts",
      ],
    },
  };

  const config = permissionConfig[permissionType] || permissionConfig[PERMISSION_TYPES.CAMERA];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="permission-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onDenied}
            role="presentation"
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            className="permission-dialog"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="permission-title"
            aria-describedby="permission-description"
          >
            <div className="dialog-content">
              {/* Header */}
              <div className="dialog-header">
                <span className="permission-icon">{config.icon}</span>
                <h2 id="permission-title" className="dialog-title">
                  {config.title}
                </h2>
              </div>

              {/* Description */}
              <div id="permission-description" className="dialog-description">
                <p className="main-description">{config.description}</p>

                {/* Details */}
                <div className="permission-details">
                  <h3 className="details-title">This will:</h3>
                  <ul className="details-list">
                    {config.details.map((detail, idx) => (
                      <li key={idx} className="detail-item">
                        <span className="detail-check">✓</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Privacy Notice */}
                <div className="privacy-notice">
                  <span className="notice-icon">🔒</span>
                  <p className="notice-text">
                    You can change permissions anytime in your device settings.
                    Your data is never shared without your explicit consent.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="dialog-actions">
                <button
                  onClick={onDenied}
                  className="action-btn deny"
                  aria-label="Deny permission"
                >
                  <span className="btn-icon">✕</span>
                  <span>Not Now</span>
                </button>
                <button
                  onClick={onGranted}
                  className="action-btn grant"
                  aria-label="Grant permission"
                >
                  <span className="btn-icon">✓</span>
                  <span>Allow</span>
                </button>
              </div>

              {/* Fallback Info */}
              <div className="fallback-info">
                <p className="fallback-text">
                  Emergency features may be limited without this permission.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default PermissionDialog;
