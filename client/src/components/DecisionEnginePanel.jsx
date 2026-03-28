import { useState } from "react";
import { apiClient } from "../api/apiClient";
import { useAppContextState } from "../context/EmergencyContext";
import { useAuth } from "../context/AuthContext";
import { Zap, Phone, Navigation, AlertTriangle, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DecisionEnginePanel() {
  const { setCurrentContext } = useAppContextState();
  const { track } = useAuth();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const analyze = async (event) => {
    event.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.post("/ai/decision-engine", { input });
      setResult(response.data);
      if (["safety", "medical", "disaster", "emergency"].includes(response.data.category)) {
        setCurrentContext(response.data.category);
      }
      await track("emergency", { status: response.data.status, category: response.data.category, summary: input.slice(0, 120) }).catch(() => undefined);
    } catch { setError("Failed to analyze situation"); } finally { setLoading(false); }
  };

  const runAction = async (action) => {
    const label = String(action.label || "").toLowerCase();
    if (action.type === "call") {
      window.location.href = label.includes("ambulance") || label.includes("medical") ? "tel:108" : "tel:112";
      return;
    }
    if (action.type === "navigate") { window.open("https://maps.google.com", "_blank", "noopener,noreferrer"); return; }
    await navigator.clipboard.writeText(action.label);
  };

  return (
    <section className="card" style={{ borderTop: "2px solid rgba(220,38,38,0.3)", position: "relative", overflow: "hidden" }}>
      {/* Scan-line */}
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(220,38,38,0.015) 3px, rgba(220,38,38,0.015) 6px)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <h2 className="title" style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "var(--font-tactical)", letterSpacing: "0.04em" }}>
          <Zap size={22} color="#DC2626" /> Emergency Guidance
        </h2>
        <p className="subtle" style={{ marginBottom: "1.2rem", fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>
          Describe the situation. OMINA provides immediate support steps and quick actions.
        </p>

        <form onSubmit={analyze}>
          <textarea
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="E.g., 'There is a fire spreading rapidly near the downtown block...'"
            required
            style={{ fontSize: "1rem", padding: "1.2rem", fontFamily: "var(--font-mono)" }}
          />
          <button type="submit" disabled={loading} className="btn-danger" style={{ width: "100%", marginTop: "1rem", fontSize: "1rem", padding: "0.9rem", fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>
            {loading ? (<><span className="spinner" /> ANALYZING...</>) : "▶ GET HELP NOW"}
          </button>
        </form>

        {error ? <p className="sos-error" style={{ marginTop: "1rem" }}>{error}</p> : null}

        <AnimatePresence>
          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              style={{
                marginTop: "1.5rem",
                padding: "1.5rem",
                background: "var(--bg-card)",
                border: "1px solid rgba(220,38,38,0.2)",
                borderRadius: "var(--radius-lg)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-glass)", paddingBottom: "1rem", marginBottom: "1.2rem" }}>
                <div>
                  <span style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>Urgency</span>
                  <strong style={{ fontSize: "1.15rem", color: result.status === "critical" ? "#DC2626" : "#D97706", fontFamily: "var(--font-tactical)" }}>{result.status.toUpperCase()}</strong>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>Category</span>
                  <strong style={{ fontSize: "1.15rem", color: "#3B82F6", fontFamily: "var(--font-tactical)" }}>{result.category.toUpperCase()}</strong>
                </div>
              </div>

              <div>
                <h4 style={{ color: "var(--text-primary)", marginBottom: "0.8rem", fontFamily: "var(--font-tactical)", fontSize: "0.95rem", letterSpacing: "0.06em" }}>
                  <Shield size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} /> IMMEDIATE ACTIONS
                </h4>
                <div className="action-buttons">
                  {(result.actions || []).map((action, index) => (
                    <motion.button
                      key={`${action.label}-${index}`}
                      type="button"
                      className="btn-danger"
                      style={{ display: "inline-flex", gap: "8px", alignItems: "center", fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}
                      onClick={() => runAction(action).catch(() => undefined)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + index * 0.08 }}
                    >
                      {action.type === "call" ? <Phone size={14} /> : action.type === "navigate" ? <Navigation size={14} /> : <AlertTriangle size={14} />} {action.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "1.5rem", padding: "1.2rem", background: "rgba(0,0,0,0.15)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-glass)" }}>
                <h4 style={{ color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.78rem", marginBottom: "0.8rem", fontFamily: "var(--font-mono)" }}>Step-by-step guidance</h4>
                <ol style={{ margin: 0, paddingLeft: "1.5rem" }}>
                  {(result.instructions || []).map((item, i) => (
                    <motion.li
                      key={item}
                      style={{ padding: "0.4rem 0", color: "var(--text-primary)", fontSize: "0.95rem", fontFamily: "var(--font-mono)" }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                    >
                      {item}
                    </motion.li>
                  ))}
                </ol>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
