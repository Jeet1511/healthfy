import { NavLink } from "react-router-dom";
import SOSFloatingButton from "./SOSFloatingButton";
import AssistancePanel from "./AssistancePanel"; // NEW
import { useAppContextState } from "../context/EmergencyContext";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import AuthModal from "./AuthModal";

const links = [
  { to: "/", label: "Home" },
  { to: "/emergency", label: "Emergency" },
  { to: "/safety", label: "Safety" },
  { to: "/disaster", label: "Disaster" },
  { to: "/map", label: "Map" },
  { to: "/profile", label: "Profile" },
  { to: "/admin", label: "Admin" },
];

export default function AppShell({ children }) {
  const { currentContext } = useAppContextState();
  const { session } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <main className={`container ${currentContext}-ui`}>
      <header className="glass-nav">
        <div>
          <h1 className="brand">OMINA</h1>
          <p className="subtle">Intelligent Protection & Live Guidance</p>
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
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      
      {/* The main workspace will be split-screen or stacked */}
      <section className="page-stack">{children}</section>
      
      {/* Floating global elements */}
      <SOSFloatingButton />
      <AssistancePanel />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </main>
  );
}
