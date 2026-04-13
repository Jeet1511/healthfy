import { useEffect, useState } from "react";
import { useEmergency } from "@/context/EmergencyContext";
import FloatingSOSButton from "@/components/emergency/FloatingSOSButton";
import SOSActivationModal from "@/components/emergency/SOSActivationModal";
import FakeCallPanel from "@/components/safety/FakeCallPanel";
import LiveTrackingPanel from "@/components/safety/LiveTrackingPanel";
import StatusIndicatorsPanel from "@/components/safety/StatusIndicatorsPanel";
import SystemLogPanel from "@/components/safety/SystemLogPanel";
import PermissionCheckPanel from "@/components/safety/PermissionCheckPanel";
import InfoSection from "@/components/safety/InfoSection";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";
import { motion } from "framer-motion";
import { Shield, Phone, AlertTriangle } from "lucide-react";
import "./SafetyPage.css";

export default function SafetyPage() {
  const { emergencyActive, setCurrentContext, appMode, sosStatus, addStatusLog } = useEmergency();
  const { toasts, showToast, removeToast } = useToast();
  const [showSOSModal, setShowSOSModal] = useState(false);

  const isEmergency = appMode === "emergency";

  useEffect(() => {
    setCurrentContext("safety");
  }, [setCurrentContext]);

  // Monitor SOS status and show notifications
  useEffect(() => {
    if (sosStatus === "triggered") {
      showToast("🚨 SOS Activated - Emergency services notified!", "error", 5000);
      setShowSOSModal(true);
    }
  }, [sosStatus, showToast]);

  // Close modal when emergency ends
  useEffect(() => {
    if (!isEmergency) {
      setShowSOSModal(false);
    }
  }, [isEmergency]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="safety-page-wrapper"
    >
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Floating SOS Button */}
      <FloatingSOSButton />

      {/* SOS Activation Modal */}
      <SOSActivationModal isOpen={showSOSModal} onClose={() => setShowSOSModal(false)} />

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
                <p className="subtle">Your location and information are being sent to emergency contacts.</p>
                <div style={{ marginTop: "1rem", fontSize: "0.9rem", lineHeight: "1.6" }}>
                  <p>✓ Audio recording active</p>
                  <p>✓ Location tracking active</p>
                  <p>✓ Contacts notified</p>
                </div>
              </section>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
