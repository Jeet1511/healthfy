import DecisionEnginePanel from "../components/DecisionEnginePanel";
import { useEffect } from "react";
import { useEmergency } from "../context/EmergencyContext";

export default function EmergencyPage() {
  const { setCurrentContext } = useEmergency();

  useEffect(() => {
    setCurrentContext("emergency");
  }, [setCurrentContext]);

  return (
    <div style={{ animation: "pulse-danger 3s infinite", borderRadius: "20px" }}>
      <section className="hero card interactive" style={{ border: "2px solid rgba(239, 68, 68, 0.4)", background: "linear-gradient(135deg, rgba(8, 11, 20, 0.9), rgba(40, 0, 0, 0.4))" }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "rgba(239, 68, 68, 0.2)", padding: "8px 16px", borderRadius: "99px", color: "#fca5a5", fontSize: "0.9rem", fontWeight: "bold", marginBottom: "1rem" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 10px #ef4444" }}></span>
            CRITICAL MODE ACTIVE
          </div>
          <h2 className="title" style={{ fontSize: "2.5rem", color: "#f87171" }}>Live Emergency Response</h2>
          <p className="subtle" style={{ fontSize: "1.1rem", color: "#fecaca" }}>
            The system is actively monitoring your situation. Provide details below for immediate protocol generation and routing.
          </p>
        </div>
      </section>

      <div className="grid single-column">
        <DecisionEnginePanel />
      </div>
    </div>
  );
}
