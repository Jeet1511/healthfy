import { useEffect, useState } from "react";
import { useEmergency } from "@/context/EmergencyContext";
import SOSActivationModal from "@/components/emergency/SOSActivationModal";
import FakeCallPanel from "@/components/safety/FakeCallPanel";
import LiveTrackingPanel from "@/components/safety/LiveTrackingPanel";
import StatusIndicatorsPanel from "@/components/safety/StatusIndicatorsPanel";
import SystemLogPanel from "@/components/safety/SystemLogPanel";
import PermissionCheckPanel from "@/components/safety/PermissionCheckPanel";
import InfoSection from "@/components/safety/InfoSection";
import EvidenceDashboard from "@/components/EvidenceDashboard";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Phone, AlertTriangle, ShieldAlert } from "lucide-react";
import {
  PERMISSION_STATUS,
  PERMISSION_TYPES,
} from "@/services/permissionOrchestrator";
import "./SafetyPage.css";

export default function SafetyPage() {
  const routerLocation = useLocation();
  const { setCurrentContext, appMode, sosStatus, networkStatus, emergencySession, permissions } = useEmergency();
  const { toasts, showToast, removeToast } = useToast();
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [blockedCriticalPermissions, setBlockedCriticalPermissions] = useState([]);
  const [allowDegradedPermissions, setAllowDegradedPermissions] = useState(false);

  const sharedEvidenceToken = new URLSearchParams(routerLocation.search).get("sharedEvidenceToken");
  const isSharedEvidenceView = Boolean(sharedEvidenceToken);

  const isEmergency = appMode === "emergency";
  const criticalTypes = [PERMISSION_TYPES.LOCATION, PERMISSION_TYPES.MICROPHONE];

  const emergencyGateRequired =
    isEmergency &&
    !allowDegradedPermissions &&
    criticalTypes.some((type) => {
      const status = permissions[type];
      return [PERMISSION_STATUS.PROMPT, PERMISSION_STATUS.DENIED, PERMISSION_STATUS.UNAVAILABLE].includes(
        status
      );
    });

  useEffect(() => {
    setCurrentContext("safety");
  }, [setCurrentContext]);

  useEffect(() => {
    if (!isEmergency) {
      setAllowDegradedPermissions(false);
      setBlockedCriticalPermissions([]);
    }
  }, [isEmergency]);

  // Monitor SOS status and show notifications
  useEffect(() => {
    if (isSharedEvidenceView) {
      setShowSOSModal(false);
      return;
    }
    if (sosStatus === "triggered" || sosStatus === "recording") {
      showToast("🚨 SOS Activated - Emergency services notified!", "error", 5000);
      setShowSOSModal(true);
    }
  }, [isSharedEvidenceView, sosStatus, showToast]);

  // Close modal when emergency ends
  useEffect(() => {
    if (isSharedEvidenceView) {
      setShowSOSModal(false);
      return;
    }
    if (!isEmergency) {
      setShowSOSModal(false);
    }
  }, [isEmergency, isSharedEvidenceView]);

  if (isSharedEvidenceView) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="safety-page-wrapper"
        data-mode="shared-evidence"
      >
        <EvidenceDashboard sharedToken={sharedEvidenceToken} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="safety-page-wrapper"
      data-mode={appMode}
    >
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* SOS Activation Modal */}
      <SOSActivationModal isOpen={showSOSModal} onClose={() => setShowSOSModal(false)} />

      {emergencyGateRequired && (
        <div className="emergency-permission-overlay" role="dialog" aria-modal="true">
          <div className="emergency-permission-card">
            <h3>
              <ShieldAlert size={18} />
              Emergency Permission Recovery Required
            </h3>
            <p>
              Critical permissions are blocked. Enable location and microphone for full emergency reliability.
            </p>

            <PermissionCheckPanel
              modeOverride="emergency"
              onCriticalStateChange={setBlockedCriticalPermissions}
            />

            {blockedCriticalPermissions.length > 0 && (
              <p className="emergency-gate-warning">
                Continuing without full access will run in degraded mode with reduced evidence quality.
              </p>
            )}

            <div className="emergency-gate-actions">
              <button
                type="button"
                className="btn-warning"
                onClick={() => setAllowDegradedPermissions(true)}
              >
                Continue In Degraded Mode
              </button>
            </div>
          </div>
        </div>
      )}

      {isEmergency && (
        <motion.section
          className="card emergency-live-banner"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="emergency-live-headline">Emergency Active</div>
          <p>
            High-priority mode is running with continuous tracking and recording fallback.
          </p>
          <p>
            Network: {networkStatus.isOnline ? "Online" : "Offline"}
            {` • Queued Alerts: ${emergencySession.queuedAlerts || 0}`}
            {` • Queued Location Logs: ${emergencySession.queuedLocationLogs || 0}`}
          </p>
        </motion.section>
      )}

      {/* Permission Check (if not in emergency) */}
      {!isEmergency && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <PermissionCheckPanel />
        </motion.div>
      )}

      {/* SECTION 2: LIVE STATUS PANEL - MIDDLE */}
      {isEmergency && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatusIndicatorsPanel />
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div className="safety-content-grid">
        {/* Left Column: Tracking & Contact */}
        <div className="left-column">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <LiveTrackingPanel />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <section className="card">
              <h3 className="title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Phone size={20} />
                Emergency Dial
              </h3>
              <p className="subtle">Direct emergency call for immediate intervention.</p>
              <a
                className="btn-danger"
                href="tel:112"
                style={{
                  marginTop: "1rem",
                  display: "inline-flex",
                  textDecoration: "none",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "6px",
                  fontWeight: "600",
                }}
              >
                📞 Call Emergency (112)
              </a>
            </section>
          </motion.div>

          {!isEmergency && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <FakeCallPanel />
            </motion.div>
          )}
        </div>

        {/* Right Column: Status & Logs */}
        <div className="right-column">
          {/* SECTION 3: SYSTEM LOG PANEL - BOTTOM (Right Side) */}
          {isEmergency && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <SystemLogPanel />
            </motion.div>
          )}

          {/* SECTION 4: INFO PANEL */}
          {!isEmergency && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <InfoSection />
            </motion.div>
          )}

          {isEmergency && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="emergency-actions"
            >
              <section className="card" style={{ background: "linear-gradient(135deg, #fef2f2, #fff0f0)" }}>
                <h3 className="title" style={{ display: "flex", alignItems: "center", gap: "8px", color: "#dc2626" }}>
                  <AlertTriangle size={20} />
                  Emergency Active
                </h3>
                <p className="subtle">Your location, recordings, and alert queue are actively managed in fail-safe mode.</p>
                <div style={{ marginTop: "1rem", fontSize: "0.9rem", lineHeight: "1.6" }}>
                  <p>✓ Emergency tracking active</p>
                  <p>✓ Media recording with fallback</p>
                  <p>✓ Alerts queued/retried if delivery fails</p>
                </div>
              </section>
            </motion.div>
          )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: isEmergency ? 0.95 : 0.65 }}
      >
        <EvidenceDashboard />
      </motion.div>
    </motion.div>
  );
}
