import { useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { User } from "lucide-react";

function Timeline({ title, items, renderLine }) {
  return (
    <section className="card">
      <h3 className="title">{title}</h3>
      <div className="timeline-container" style={{ position: "relative", paddingLeft: "20px", borderLeft: "2px solid rgba(59, 130, 246, 0.3)", margin: "1rem 0" }}>
        {items.length ? items.map((item, index) => (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} key={index} style={{ position: "relative", marginBottom: "1.5rem" }}>
            <div style={{ position: "absolute", left: "-27px", top: "4px", width: "12px", height: "12px", borderRadius: "50%", background: "#3b82f6", boxShadow: "0 0 8px #3b82f6" }}></div>
            {renderLine(item, index)}
          </motion.div>
        )) : <p className="subtle" style={{ marginLeft: "10px" }}>No records yet.</p>}
      </div>
    </section>
  );
}

export default function ProfilePage() {
  const { profile, fetchProfile, session, logout, removeSavedPlace, cancelBooking } = useAuth();

  useEffect(() => { fetchProfile().catch(() => undefined); }, [fetchProfile]);

  const activity = useMemo(() => (profile?.activityHistory || []).slice().reverse().slice(0, 20), [profile]);
  const emergencies = useMemo(() => (profile?.emergencyLogs || []).slice().reverse().slice(0, 20), [profile]);
  const searches = useMemo(() => (profile?.searchLogs || []).slice().reverse().slice(0, 20), [profile]);
  const savedPlaces = useMemo(() => (profile?.savedPlaces || []).slice(0, 20), [profile]);
  const bookings = useMemo(() => (profile?.bookings || []).slice(0, 20), [profile]);

  return (
    <>
      <section className="card interactive" style={{ background: "linear-gradient(135deg, rgba(8,11,20,0.8), rgba(20,30,50,0.6))" }}>
        <div className="admin-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(59, 130, 246, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(59, 130, 246, 0.5)", color: "#60a5fa" }}>
              <User size={32} />
            </div>
            <div>
              <h2 className="title" style={{ margin: 0 }}>{profile?.email || "Guest User"}</h2>
              <p className="subtle" style={{ margin: 0 }}>Mode: <strong style={{ color: "#fff" }}>{session.mode === "user" ? "Registered User" : session.mode === "guest" ? "Guest Session" : "Signed out"}</strong></p>
            </div>
          </div>
          {session.mode !== "none" ? (<button type="button" className="btn btn-primary" onClick={logout}>Sign Out</button>) : null}
        </div>
      </section>

      <div className="grid">
        <Timeline title="Activity Timeline" items={activity} renderLine={(item) => (
          <article className="list-item timeline-item" style={{ background: "rgba(10, 14, 28, 0.8)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "1rem" }}>
            <strong style={{ color: "#fff", display: "block", marginBottom: "4px" }}>{item.label || "Action"}</strong>
            <span style={{ fontSize: "0.85rem", color: "#8a96bc", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "4px" }}>{item.category || "general"}</span>
          </article>
        )} />
        <Timeline title="Past Emergencies" items={emergencies} renderLine={(item) => (
          <article className="list-item timeline-item" style={{ background: "rgba(30, 0, 0, 0.4)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "12px", padding: "1rem" }}>
            <strong style={{ color: "#fca5a5", display: "block", marginBottom: "4px" }}>{item.status?.toUpperCase() || "ALERT"} • {item.category}</strong>
            <p className="subtle" style={{ margin: 0, fontSize: "0.95rem" }}>{item.summary || "Emergency log"}</p>
          </article>
        )} />
      </div>

      <div className="grid single-column">
        <Timeline title="Recent Searches & Guidance" items={searches} renderLine={(item) => (
          <article className="list-item timeline-item" style={{ background: "rgba(10, 14, 28, 0.8)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "1rem" }}>
            <strong style={{ color: "#e2e8f0", display: "block", marginBottom: "4px" }}>"{item.query}"</strong>
            <span style={{ fontSize: "0.85rem", color: "#10b981", background: "rgba(16, 185, 129, 0.1)", padding: "2px 8px", borderRadius: "4px" }}>Filter: {item.type || "all"}</span>
          </article>
        )} />
      </div>

      <div className="grid">
        <section className="card">
          <h3 className="title">Saved Places</h3>
          {savedPlaces.length ? (
            <div className="resource-list" style={{ maxHeight: "none" }}>
              {savedPlaces.map((item) => (
                <article key={item.id} className="resource-row">
                  <div><strong>{item.name}</strong><p>{item.address}</p><p style={{ fontSize: "0.85rem" }}>{item.type}</p></div>
                  <button type="button" onClick={() => removeSavedPlace(item.id).catch(() => undefined)}>Remove</button>
                </article>
              ))}
            </div>
          ) : (<p className="subtle">No saved places yet.</p>)}
        </section>
        <section className="card">
          <h3 className="title">Bookings</h3>
          {bookings.length ? (
            <div className="resource-list" style={{ maxHeight: "none" }}>
              {bookings.map((item) => (
                <article key={item.id} className="resource-row">
                  <div><strong>{item.providerName}</strong><p>{item.date} • {item.slot}</p><p style={{ fontSize: "0.85rem" }}>{item.address}</p></div>
                  <button type="button" onClick={() => cancelBooking(item.id).catch(() => undefined)}>Cancel</button>
                </article>
              ))}
            </div>
          ) : (<p className="subtle">No bookings yet.</p>)}
        </section>
      </div>
    </>
  );
}
