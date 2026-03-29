import { useEffect } from "react";
import { useEmergency } from "@/context/EmergencyContext";
import FakeCallPanel from "@/components/safety/FakeCallPanel";
import LiveTrackingPanel from "@/components/safety/LiveTrackingPanel";
import PanicPanel from "@/components/safety/PanicPanel";
import { motion } from "framer-motion";
import { Shield, Phone } from "lucide-react";

export default function SafetyPage() {
  const { emergencyActive, setEmergencyActive, setCurrentContext, appMode } = useEmergency();
  const isEmergency = appMode === "emergency";

  useEffect(() => { setCurrentContext("safety"); }, [setCurrentContext]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <section className="hero card" style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: isEmergency ? "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(220,38,38,0.015) 2px, rgba(220,38,38,0.015) 4px)" : "none", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.5rem" }}>
            <Shield size={24} color={isEmergency ? "#DC2626" : "var(--accent)"} />
            <h2 className="title" style={{ fontSize: "1.6rem" }}>
              {isEmergency ? "SHIELD PROTOCOL" : "Safety Mode"}
            </h2>
          </div>
          <p className="subtle" style={isEmergency ? { fontFamily: "var(--font-mono)" } : {}}>
            {isEmergency ? "Personal safety controls. All systems armed." : "Minimal, instant-access controls for personal safety emergencies."}
          </p>
        </div>
      </section>

      <div className="grid">
        <PanicPanel onTrigger={() => setEmergencyActive(true)} active={emergencyActive} />
        <FakeCallPanel />
      </div>

      <div className="grid">
        <LiveTrackingPanel />
        <section className="card">
          <h3 className="title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Phone size={18} /> {isEmergency ? "EMERGENCY DIAL" : "Emergency Calls"}
          </h3>
          <p className="subtle" style={isEmergency ? { fontFamily: "var(--font-mono)" } : {}}>
            Direct emergency dial options for immediate intervention.
          </p>
          <a className="btn-danger" href="tel:112" style={{ marginTop: "1rem", display: "inline-flex", textDecoration: "none" }}>
            {isEmergency ? "◈ CALL 112" : "Call Police"}
          </a>
        </section>
      </div>
    </motion.div>
  );
}
