import { NavLink } from "react-router-dom";
import SOSFloatingButton from "./SOSFloatingButton";
import AssistancePanel from "./AssistancePanel";
import { useAppContextState } from "../context/EmergencyContext";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import AuthModal from "./AuthModal";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { to: "/", label: "Home", eLabel: "HQ" },
  { to: "/emergency", label: "Emergency", eLabel: "ALERT" },
  { to: "/safety", label: "Safety", eLabel: "SHIELD" },
  { to: "/disaster", label: "Disaster", eLabel: "THREAT" },
  { to: "/map", label: "Map", eLabel: "SCAN" },
  { to: "/profile", label: "Profile", eLabel: "ID" },
];

function AmbientBackground({ mode }) {
  if (mode === "emergency") {
    return <div className="tactical-grid" aria-hidden="true" />;
  }
  return (
    <div className="ambient-orbs" aria-hidden="true">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
    </div>
  );
}

export default function AppShell({ children }) {
  const { currentContext, appMode } = useAppContextState();
  const { session } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const isEmergency = appMode === "emergency";

  return (
    <main className={`container ${currentContext}-ui`}>
      <AmbientBackground mode={appMode} />

      <motion.header
        className="glass-nav"
        layout
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <AnimatePresence mode="wait">
            <motion.h1
              key={isEmergency ? "e" : "d"}
              className="brand"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
            >
              {isEmergency ? "◈ OMINA" : "OMINA"}
            </motion.h1>
          </AnimatePresence>
          {isEmergency && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                fontSize: "0.65rem",
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                color: "#DC2626",
                background: "rgba(220,38,38,0.1)",
                border: "1px solid rgba(220,38,38,0.25)",
                padding: "3px 8px",
                borderRadius: "var(--radius-pill)",
                letterSpacing: "0.1em",
              }}
            >
              ACTIVE
            </motion.span>
          )}
        </div>
        <nav className="nav-links">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={(event) => {
                if (item.to === "/profile" && session.mode === "none") {
                  event.preventDefault();
                  setAuthOpen(true);
                }
              }}
              className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
              end={item.to === "/"}
            >
              {isEmergency ? item.eLabel : item.label}
            </NavLink>
          ))}
        </nav>
      </motion.header>

      <section className="page-stack">{children}</section>

      <SOSFloatingButton />
      <AssistancePanel />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </main>
  );
}
