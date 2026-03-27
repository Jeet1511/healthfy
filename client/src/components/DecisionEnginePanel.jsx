import { useState } from "react";
import { apiClient } from "../api/apiClient";
import { useAppContextState } from "../context/EmergencyContext";
import { useAuth } from "../context/AuthContext";
import { Zap, Phone, Navigation, AlertTriangle } from "lucide-react";

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
      await track("emergency", {
        status: response.data.status,
        category: response.data.category,
        summary: input.slice(0, 120),
      }).catch(() => undefined);
    } catch {
      setError("Failed to analyze situation");
    } finally {
      setLoading(false);
    }
  };

  const runAction = async (action) => {
    const label = String(action.label || "").toLowerCase();

    if (action.type === "call") {
      if (label.includes("ambulance") || label.includes("medical")) {
        window.location.href = "tel:108";
        return;
      }
      window.location.href = "tel:112";
      return;
    }

    if (action.type === "navigate") {
      window.open("https://maps.google.com", "_blank", "noopener,noreferrer");
      return;
    }

    await navigator.clipboard.writeText(action.label);
  };

  return (
    <section className="card interactive" style={{ borderTop: "2px solid rgba(59, 130, 246, 0.5)" }}>
      <h2 className="title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Zap size={24} color="#60a5fa" /> Live Threat Assessment
      </h2>
      <p className="subtle" style={{ marginBottom: "1rem" }}>
        Type or speak the details of the situation. Our system will generate immediate tactical guidance and priority actions.
      </p>
      <form onSubmit={analyze}>
        <textarea
          rows={4}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="E.g., 'There is a large fire spreading rapidly near the downtown block, spreading east...'"
          required
          style={{ fontSize: "1.1rem", padding: "1.2rem" }}
        />
        <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", marginTop: "1rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", fontSize: "1.1rem", padding: "1rem" }}>
          {loading ? (
             <><span className="spinner"></span> Processing Intelligence...</>
          ) : (
             "Run Fast Analysis"
          )}
        </button>
      </form>

      {error ? <p className="sos-error" style={{ marginTop: "1rem" }}>{error}</p> : null}

      {result ? (
        <div className="decision-result" style={{ marginTop: "2rem", padding: "2rem", background: "linear-gradient(135deg, rgba(8, 11, 20, 0.8), rgba(30, 0, 0, 0.3))", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <span className="subtle" style={{ display: "block", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px" }}>Threat Status</span>
              <strong style={{ fontSize: "1.2rem", color: result.status === "critical" ? "#ef4444" : "#f59e0b" }}>{result.status.toUpperCase()}</strong>
            </div>
            <div style={{ textAlign: "right" }}>
               <span className="subtle" style={{ display: "block", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px" }}>Protocol Core</span>
               <strong style={{ fontSize: "1.2rem", color: "#3b82f6" }}>{result.category.toUpperCase()}</strong>
            </div>
          </div>

          <div className="actions-wrap">
            <h4 style={{ color: "#fff", marginBottom: "1rem" }}>Priority Actions Needed</h4>
            <div className="action-buttons">
              {(result.actions || []).map((action, index) => (
                <button
                  key={`${action.label}-${index}`}
                  type="button"
                  className="action-pill btn-danger"
                  style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}
                  onClick={() => runAction(action).catch(() => undefined)}
                >
                  {action.type === "call" ? <Phone size={16} /> : action.type === "navigate" ? <Navigation size={16} /> : <AlertTriangle size={16} />} {action.label}
                </button>
              ))}
            </div>
          </div>

          <div className="instructions-wrap" style={{ marginTop: "2rem", padding: "1.5rem", background: "rgba(0,0,0,0.4)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <h4 style={{ color: "#8a96bc", textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.9rem", marginBottom: "1rem" }}>Guided Execution Protocol</h4>
            <ol style={{ margin: 0, paddingLeft: "1.5rem" }}>
              {(result.instructions || []).map((item) => (
                <li key={item} style={{ padding: "0.5rem 0", color: "#e2e8f0", fontSize: "1.05rem" }}>{item}</li>
              ))}
            </ol>
          </div>
        </div>
      ) : null}
    </section>
  );
}
