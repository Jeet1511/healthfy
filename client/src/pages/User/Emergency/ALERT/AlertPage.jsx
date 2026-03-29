/**
 * ALERT Page — Emergency mode version of Emergency
 * 
 * STANDALONE page. Build emergency alert UI here.
 * Uses @/ aliases for shared imports. Independent from General pages.
 */
import DecisionEnginePanel from "@/components/DecisionEnginePanel";
import { useEffect } from "react";
import { useEmergency } from "@/context/EmergencyContext";
import { motion } from "framer-motion";

export default function AlertPage() {
  const { setCurrentContext } = useEmergency();

  useEffect(() => {
    setCurrentContext("emergency");
    document.documentElement.setAttribute("data-theme", "emergency");
    return () => document.documentElement.setAttribute("data-theme", "daily");
  }, [setCurrentContext]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <motion.section className="card hero-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ border: "1px solid rgba(220,38,38,0.25)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(220,38,38,0.02) 2px, rgba(220,38,38,0.02) 4px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "rgba(220,38,38,0.1)", padding: "8px 16px", borderRadius: "var(--radius-pill)", color: "#FF6B6B", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "1.5rem", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", border: "1px solid rgba(220,38,38,0.2)" }}>
            <motion.span animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#DC2626", boxShadow: "0 0 12px rgba(220,38,38,0.6)", display: "inline-block" }} />
            ◈ ALERT PROTOCOL ACTIVE
          </motion.div>
          <h2 className="title" style={{ fontSize: "2.2rem", color: "#DC2626", fontFamily: "var(--font-tactical)", letterSpacing: "0.06em" }}>
            Emergency Alert System
          </h2>
          <p className="subtle" style={{ fontSize: "1.05rem", fontFamily: "var(--font-mono)", marginTop: "0.75rem" }}>
            Describe your emergency. OMINA will provide immediate tactical guidance.
          </p>
        </div>
      </motion.section>

      <div className="grid single-column" style={{ marginTop: "var(--space-lg)" }}>
        <DecisionEnginePanel />
      </div>
    </motion.div>
  );
}
