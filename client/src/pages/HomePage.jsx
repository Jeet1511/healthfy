import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertOctagon, HeartPulse, Shield, Wind, Flame, BadgeAlert, Search, Map
} from "lucide-react";

export default function HomePage() {
  const { track } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);

  useEffect(() => {
    track("page_view", { page: "home" }).catch(() => {});
  }, []);

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setAnalyzing(true);
    setAiResponse(null);

    setTimeout(() => {
      setAnalyzing(false);
      setAiResponse({
        status: "critical",
        alert: "Immediate Action Required",
        instructions: [
          "Move to a safe location away from immediate danger.",
          "Prepare to receive emergency broadcast instructions.",
          "Keep phone lines open."
        ]
      });
    }, 1500);
  };

  const quickActions = [
    { id: "emergency", label: "Emergency", to: "/emergency", icon: <AlertOctagon size={28} />, desc: "Immediate critical response" },
    { id: "medical", label: "Medical Crisis", to: "/emergency", icon: <HeartPulse size={28} />, desc: "First-aid & hospital routing" },
    { id: "safety", label: "I Feel Unsafe", to: "/safety", icon: <Shield size={28} />, desc: "Deterrence & tracking" },
    { id: "disaster", label: "Disaster", to: "/disaster", icon: <Wind size={28} />, desc: "Evacuation & shelters" },
    { id: "police", label: "Police", to: "/emergency", icon: <BadgeAlert size={28} />, desc: "Report active threats" },
    { id: "fire", label: "Fire", to: "/emergency", icon: <Flame size={28} />, desc: "Report & evacuate" },
  ];

  return (
    <div className="section-gap">
      <div className="heading-center">
        <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          What's happening right now?
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          Get instant help, guidance, and action in any situation.
        </motion.p>
      </div>

      <motion.div 
        className="search-wrapper"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <form className="search-bar-container" onSubmit={handleAnalyze}>
          <Search size={22} color="#a4b0d4" />
          <input
            type="text"
            className="search-input"
            placeholder="Describe your situation... (e.g. someone is following me)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn-primary search-btn" disabled={analyzing}>
            {analyzing ? "Analyzing..." : "Analyze"}
          </button>
        </form>

        <AnimatePresence>
          {analyzing && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, height: 0 }} 
              className="live-response-panel"
            >
              <div className="skeleton" style={{ height: "24px", width: "40%", marginBottom: "16px" }} />
              <div className="skeleton" style={{ height: "16px", width: "100%", marginBottom: "8px" }} />
              <div className="skeleton" style={{ height: "16px", width: "80%" }} />
            </motion.div>
          )}

          {aiResponse && !analyzing && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="live-response-panel"
            >
               <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
                 <span className="status-indicator">
                   <span className="dot" style={{ background: "#ef4444" }}></span> Critical Priority
                 </span>
               </div>
               <h3 style={{ margin: "0 0 16px 0", color: "#fff", fontSize: "1.2rem" }}>Recommended Protocol</h3>
               <ul style={{ margin: 0, paddingLeft: "20px", color: "#d4ddf7", display: "grid", gap: "8px", fontSize: "1.05rem" }}>
                 {aiResponse.instructions.map((ins, i) => (
                   <li key={i}>{ins}</li>
                 ))}
               </ul>
               <div className="action-buttons" style={{ marginTop: "24px" }}>
                 <button className="btn-danger" style={{ width: "auto", padding: "10px 24px" }}>Activate SOS</button>
                 <button className="btn-primary" style={{ width: "auto", padding: "10px 24px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>View Evacuation Map</button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <section className="section-gap">
        <div className="action-grid-fixed">
          {quickActions.map((item, i) => (
            <motion.div
              key={item.id}
              className="card interactive"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
              onClick={() => navigate(item.to)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ cursor: "pointer" }}
            >
              <div style={{ color: "#60a5fa" }}>{item.icon}</div>
              <div>
                <h3 className="title">{item.label}</h3>
                <p className="subtle">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section-gap">
        <div className="explore-section">
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2 className="title" style={{ fontSize: "1.8rem" }}>Explore Nearby Help</h2>
            <p className="subtle" style={{ fontSize: "1.05rem" }}>Locate closest resources in real-time instantly.</p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", margin: "16px 0" }}>
               <span className="type-chip tone-safe">Hospitals</span>
               <span className="type-chip tone-warning">Police</span>
               <span className="type-chip tone-danger">Fire</span>
            </div>
            <div className="resource-list" style={{ flex: 1 }}>
              <div className="resource-row">
                 <div>
                   <strong style={{ color: "#fff" }}>City General Hospital</strong>
                   <p className="subtle">1.2 km away</p>
                 </div>
              </div>
              <div className="resource-row">
                 <div>
                   <strong style={{ color: "#fff" }}>Metro Police Dept</strong>
                   <p className="subtle">2.4 km away</p>
                 </div>
              </div>
            </div>
          </div>
          <div 
            className="card interactive map-board-empty" 
            onClick={() => navigate("/map")}
            style={{ 
              minHeight: "100%", 
              backgroundImage: "radial-gradient(circle at center, rgba(30, 144, 255, 0.15), transparent 70%)",
              border: "1px solid rgba(30, 144, 255, 0.3)"
            }}
          >
             <div style={{ textAlign: "center", color: "#60a5fa" }}>
                <Map size={48} style={{ marginBottom: "16px", opacity: 0.8 }} />
                <h3>Open Interactive Map</h3>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
