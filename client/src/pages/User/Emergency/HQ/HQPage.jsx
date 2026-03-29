/**
 * HQ Page — Emergency mode version of Home
 * 
 * This is a STANDALONE page. Build your emergency Home UI here.
 * Import shared stuff using @/ aliases (e.g. @/context/AuthContext).
 * Do NOT import from General/Home — keep this independent.
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Radio, Crosshair, Siren, Shield } from "lucide-react";
import { apiClient } from "@/api/apiClient";
import { useAuth } from "@/context/AuthContext";
import { useEmergency } from "@/context/EmergencyContext";

export default function HQPage() {
  const navigate = useNavigate();
  const { session, track } = useAuth();
  const { appMode } = useEmergency();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "emergency");
  }, []);

  return (
    <div className="section-gap homepage" data-mode="emergency" style={{ marginTop: "1rem" }}>
      <motion.section
        className="card hero-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ border: "1px solid rgba(220,38,38,0.25)", position: "relative", overflow: "hidden" }}
      >
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(220,38,38,0.02) 2px, rgba(220,38,38,0.02) 4px)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "rgba(220,38,38,0.1)", padding: "8px 16px", borderRadius: "var(--radius-pill)", color: "#FF6B6B", fontSize: "0.85rem", fontWeight: "bold", marginBottom: "1.5rem", fontFamily: "var(--font-mono)", letterSpacing: "0.1em", border: "1px solid rgba(220,38,38,0.2)" }}>
            <motion.span animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#DC2626", boxShadow: "0 0 12px rgba(220,38,38,0.6)", display: "inline-block" }} />
            COMMAND HQ — ACTIVE
          </motion.div>

          <motion.h2 className="title" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{ fontSize: "2.2rem", color: "#DC2626", fontFamily: "var(--font-tactical)", letterSpacing: "0.06em" }}>
            Emergency Command Center
          </motion.h2>

          <motion.p className="subtle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ fontSize: "1.05rem", fontFamily: "var(--font-mono)", marginTop: "0.75rem" }}>
            All systems on high priority. Select an action below.
          </motion.p>
        </div>
      </motion.section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
        {[
          { label: "ALERT", icon: <Siren size={24} />, desc: "Emergency assistance", to: "/emergency" },
          { label: "SHIELD", icon: <Shield size={24} />, desc: "Safety protocols", to: "/safety" },
          { label: "SCAN", icon: <Crosshair size={24} />, desc: "Tactical map", to: "/map" },
          { label: "COMMS", icon: <Radio size={24} />, desc: "Communication hub", to: "/disaster" },
        ].map((item) => (
          <motion.div key={item.label} className="card interactive" onClick={() => navigate(item.to)}
            whileHover={{ scale: 1.03, borderColor: "rgba(220,38,38,0.5)" }}
            style={{ cursor: "pointer", textAlign: "center", padding: "2rem 1rem", border: "1px solid rgba(220,38,38,0.15)" }}>
            <div style={{ color: "#DC2626", marginBottom: "0.75rem" }}>{item.icon}</div>
            <h4 className="title" style={{ fontFamily: "var(--font-mono)", color: "#DC2626", letterSpacing: "0.1em" }}>{item.label}</h4>
            <p className="subtle" style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
