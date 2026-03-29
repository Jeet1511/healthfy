import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPinned, PhoneCall, Shield, Siren, Stethoscope, Zap, Radio, Crosshair } from "lucide-react";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { apiClient } from "@/api/apiClient";
import { useAuth } from "@/context/AuthContext";
import { useEmergency } from "@/context/EmergencyContext";
import { detectIntent } from "@/utils/intentClassifier";
import BookingModal from "@/components/BookingModal";

const DAILY_CATEGORIES = [
  { id: "healthcare", title: "Healthcare", description: "Doctors, hospitals, clinics and appointments", type: "hospital", search: "doctor" },
  { id: "safety", title: "Safety", description: "Police stations and emergency contacts", type: "police", search: "police" },
  { id: "fire", title: "Fire & Rescue", description: "Fire stations and rescue units", type: "fire", search: "fire" },
  { id: "essentials", title: "Essentials", description: "Pharmacies, blood banks, shelters", type: "all", search: "pharmacy" },
  { id: "local", title: "Local Services", description: "Nearby help centers and community services", type: "all", search: "help center" },
];

const EMERGENCY_GUIDANCE = [
  "Move to a safer public location or well-lit area.",
  "Keep your phone in hand and call emergency services if needed.",
  "Share your live location with a trusted contact.",
];

const HEALTHCARE_TYPES = new Set(["doctor", "clinic", "hospital"]);

const DAILY_GRID = [
  { id: "care", title: "Care teams", description: "Book trusted clinicians and clinics in minutes.", tag: "Healthcare", to: "/map?type=hospital", imageClass: "media-care", shape: "cross" },
  { id: "safety", title: "Safety network", description: "Reach police, safe zones, and community checkpoints.", tag: "Safety", to: "/map?type=police", imageClass: "media-safety", shape: "shield" },
  { id: "rescue", title: "Rescue response", description: "Find nearby fire & rescue stations instantly.", tag: "Fire & Rescue", to: "/map?type=fire", imageClass: "media-rescue", shape: "flare" },
  { id: "essentials", title: "Essential support", description: "Shelters, pharmacies, and supplies in one place.", tag: "Essentials", to: "/map?type=pharmacy", imageClass: "media-essentials", shape: "bag" },
  { id: "community", title: "Community help", description: "Local centers and on-the-ground volunteers.", tag: "Local", to: "/map?search=help%20center", imageClass: "media-community", shape: "people" },
  { id: "preparedness", title: "Preparedness kits", description: "Checklists and tools for everyday readiness.", tag: "Preparedness", to: "/safety", imageClass: "media-preparedness", shape: "checklist" },
];

const EMERGENCY_GRID = [
  { id: "sos", title: "Immediate SOS", description: "Dispatch urgent response teams instantly.", tag: "CRITICAL", to: "/emergency", imageClass: "media-rescue", shape: "cross" },
  { id: "fire_rescue", title: "Fire & Rescue", description: "Find nearby fire & rescue stations instantly.", tag: "DISASTER", to: "/map?type=fire", imageClass: "media-care", shape: "flare" },
  { id: "police", title: "Police & Security", description: "Direct line to law enforcement and safe spots.", tag: "SAFETY", to: "/map?type=police", imageClass: "media-safety", shape: "shield" },
];

const svgbounce = { y: [0, -10, 0], scale: [1, 1.05, 1], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } };

const FEATURED_SVGS = {
  cross: (
    <motion.svg viewBox="0 0 120 120" className="media-svg" role="img" animate={svgbounce}>
      <defs><linearGradient id="gf" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ffffff" /><stop offset="100%" stopColor="#efd5c3" /></linearGradient></defs>
      <rect x="48" y="18" width="24" height="84" rx="8" /><rect x="18" y="48" width="84" height="24" rx="8" />
      <motion.circle cx="92" cy="28" r="10" animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
    </motion.svg>
  ),
  shield: (
    <motion.svg viewBox="0 0 120 120" className="media-svg" role="img" animate={{ rotateY: [0, 15, 0, -15, 0], scale: [1, 1.02, 1] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
      <defs><linearGradient id="gfs" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ffffff" /><stop offset="100%" stopColor="#e3c2ab" /></linearGradient></defs>
      <path fill="url(#gfs)" d="M60 12 L96 26 V58 C96 84 78 102 60 110 C42 102 24 84 24 58 V26 Z" />
      <motion.path fill="url(#gfs)" d="M60 30 L75 38 V56 C75 70 66 80 60 84 C54 80 45 70 45 56 V38 Z" animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 3, repeat: Infinity }} />
    </motion.svg>
  ),
  flare: (
    <motion.svg viewBox="0 0 120 120" className="media-svg" role="img" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}>
      <defs><linearGradient id="gff" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ffffff" /><stop offset="100%" stopColor="#efd5c3" /></linearGradient></defs>
      <motion.circle fill="url(#gff)" cx="60" cy="60" r="26" animate={{ r: [26, 32, 26] }} transition={{ duration: 1.5, repeat: Infinity }} />
      <path fill="url(#gff)" d="M60 10 L68 34 L92 28 L76 48 L100 60 L76 72 L92 92 L68 86 L60 110 L52 86 L28 92 L44 72 L20 60 L44 48 L28 28 L52 34 Z" />
    </motion.svg>
  ),
  bag: (
    <motion.svg viewBox="0 0 120 120" className="media-svg" role="img" animate={svgbounce}>
      <defs><linearGradient id="gfb" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ffffff" /><stop offset="100%" stopColor="#ebd1be" /></linearGradient></defs>
      <rect fill="url(#gfb)" x="24" y="38" width="72" height="60" rx="14" />
      <path fill="url(#gfb)" d="M40 38 C40 26 48 18 60 18 C72 18 80 26 80 38" />
      <motion.rect fill="url(#gfb)" x="54" y="56" width="12" height="24" rx="4" animate={{ opacity: [1, 0.5, 1], y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity }} />
    </motion.svg>
  ),
  people: (
    <motion.svg viewBox="0 0 120 120" className="media-svg" role="img" animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
      <defs><linearGradient id="gfp" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ffffff" /><stop offset="100%" stopColor="#ebd1be" /></linearGradient></defs>
      <circle fill="url(#gfp)" cx="40" cy="46" r="14" /><circle fill="url(#gfp)" cx="80" cy="46" r="14" />
      <path fill="url(#gfp)" d="M22 92 C24 72 36 62 40 62 C44 62 56 72 58 92" />
      <path fill="url(#gfp)" d="M62 92 C64 72 76 62 80 62 C84 62 96 72 98 92" />
      <circle fill="url(#gfp)" cx="60" cy="34" r="12" />
      <path fill="url(#gfp)" d="M44 94 C46 72 56 60 60 60 C64 60 74 72 76 94" />
    </motion.svg>
  ),
  checklist: (
    <motion.svg viewBox="0 0 120 120" className="media-svg" role="img" animate={{ rotateZ: [0, 5, -5, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
      <defs><linearGradient id="gfc" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ffffff" /><stop offset="100%" stopColor="#e3c2ab" /></linearGradient></defs>
      <rect fill="url(#gfc)" x="26" y="18" width="68" height="84" rx="12" />
      <path d="M38 44 L46 52 L62 36" />
      <motion.rect fill="url(#gfc)" x="38" y="62" width="44" height="8" rx="4" animate={{ width: [0, 44, 44] }} transition={{ duration: 3, repeat: Infinity }} />
      <motion.rect fill="url(#gfc)" x="38" y="78" width="36" height="8" rx="4" animate={{ width: [0, 36, 36] }} transition={{ duration: 3, delay: 0.5, repeat: Infinity }} />
    </motion.svg>
  ),
};

function AnimatedCounter({ from = 0, to }) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (l) => Math.round(l));
  useEffect(() => {
    const c = animate(count, to, { duration: 1.2, delay: 0.2, type: "tween", ease: "easeOut" });
    return c.stop;
  }, [count, to]);
  return <motion.span>{rounded}</motion.span>;
}

function LiveTicker({ mode }) {
  const [index, setIndex] = useState(0);
  const safeTips = [
    "Tip: Prepare a 72-hour basic emergency supply kit.",
    "Stay Hydrated: Drink water regularly during hot days.",
    "Did you know? Omina verified 12 new health clinics today.",
    "Community: Follow your local health board for updates.",
  ];
  const emergencyAlerts = [
    "◈ EMERGENCY PROTOCOLS ACTIVE — All systems on high priority.",
    "◈ Priority routing enabled — Emergency services accelerated.",
    "◈ Share location with trusted contacts — Stay connected.",
    "◈ Offline maps available — Connection resilience active.",
  ];
  const list = mode === "emergency" ? emergencyAlerts : safeTips;
  useEffect(() => { const t = setInterval(() => setIndex((p) => (p + 1) % list.length), 4000); return () => clearInterval(t); }, [list.length]);
  return (
    <div className="live-ticker-strip">
      <AnimatePresence mode="wait">
        <motion.p key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
          {list[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { session, track, addBooking } = useAuth();
  const { appMode, enterDailyMode, enterEmergencyMode } = useEmergency();
  const isEmergency = appMode === "emergency";

  useEffect(() => { document.documentElement.setAttribute("data-theme", appMode); }, [appMode]);

  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [nearby, setNearby] = useState([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingProvider, setBookingProvider] = useState(null);

  const isGuestMode = session.mode !== "user";
  const greeting = useMemo(() => { const h = new Date().getHours(); if (h < 12) return "Good morning"; if (h < 18) return "Good afternoon"; return "Good evening"; }, []);

  const insights = useMemo(() => [
    { id: "nearby", label: isEmergency ? "Active Units" : "Active services", value: nearby.length || 0, hint: loadingNearby ? "Scanning..." : isEmergency ? "Response units nearby" : "Around you right now" },
    { id: "mode", label: isEmergency ? "OPMODE" : "Current mode", value: isEmergency ? "EMERGENCY" : "Daily", hint: isEmergency ? "All systems on alert" : "Everyday needs" },
    { id: "results", label: isEmergency ? "Intel" : "Latest search", value: result?.list?.length ? `${result.list.length} found` : "Ready", hint: result?.summary || (isEmergency ? "Awaiting input" : "Start with a smart search") },
    { id: "profile", label: isEmergency ? "AUTH" : "Profile access", value: isGuestMode ? "Guest" : "Signed in", hint: isGuestMode ? "Limited access" : "Synced" },
  ], [nearby, loadingNearby, appMode, result, isGuestMode, isEmergency]);

  const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

  useEffect(() => { track("activity", { label: "Opened OMINA home", category: "page" }).catch(() => undefined); }, []);
  useEffect(() => {
    const load = async () => { setLoadingNearby(true); try { const r = await apiClient.get("/resources?type=all"); setNearby((r.data.data || []).slice(0, 8)); } catch { setNearby([]); } finally { setLoadingNearby(false); } };
    load().catch(() => undefined);
  }, []);

  const dailyHealthcareProvider = useMemo(() => nearby.find((i) => HEALTHCARE_TYPES.has(i.type)) || null, [nearby]);

  const runSmartSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const intent = detectIntent(query);
    await track("search", { query, type: intent.mode }).catch(() => undefined);
    if (intent.mode === "emergency") {
      enterEmergencyMode();
      setResult({ mode: "emergency", urgency: intent.urgency, title: "Emergency mode activated", summary: "Immediate guidance is ready. Take action now.", instructions: EMERGENCY_GUIDANCE });
      return;
    }
    enterDailyMode();
    try {
      const r = await apiClient.get(`/resources?type=all&search=${encodeURIComponent(query)}`);
      const list = r.data.data || [];
      setResult({ mode: "daily", urgency: "normal", title: "Services found", summary: list.length ? `We found ${list.length} relevant services near you.` : "No direct match found. Try a nearby category.", list });
    } catch { setResult({ mode: "daily", urgency: "normal", title: "Services found", summary: "Unable to fetch live results right now.", list: [] }); }
  };

  const openBooking = (p) => { setBookingProvider(p); setBookingOpen(true); };
  const confirmBooking = async (b) => { if (isGuestMode) return; await addBooking(b); setBookingOpen(false); };

  return (
    <div className="section-gap homepage" data-mode={appMode} style={{ marginTop: "1rem" }}>
      {/* MODE TOGGLE */}
      <div className="mode-selector-wrapper">
        <label className="kicker" style={{ marginRight: "1rem" }}>{isEmergency ? "SYS MODE:" : "System Mode:"}</label>
        <div className="mode-toggle">
          <motion.div className="mode-pill" layout initial={false}
            animate={{ x: isEmergency ? "100%" : "0%", width: isEmergency ? "150px" : "110px" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ background: isEmergency ? "linear-gradient(135deg, #DC2626, #991B1B)" : "linear-gradient(135deg, #1F8A7A, #157A6E)" }}
          />
          <button type="button" className={`mode-btn ${!isEmergency ? "active" : ""}`} onClick={enterDailyMode} style={{ width: "110px", justifyContent: "center" }}>
            DAILY
          </button>
          <button type="button" className={`mode-btn ${isEmergency ? "active" : ""}`} onClick={enterEmergencyMode} style={{ width: "150px", justifyContent: "center" }}>
            {isEmergency ? "◈ EMERGENCY" : "EMERGENCY"}
          </button>
        </div>
      </div>

      <LiveTicker mode={appMode} />

      {/* HERO */}
      <motion.section className="card hero-card home-hero" initial="hidden" animate="visible" variants={stagger} style={{ position: "relative", overflow: "hidden" }}>
        <div className="bg-motion-layer" />
        <div className={`hero-glow ${isEmergency ? "danger" : "safe"}`} />
        <div className="hero-layout">
          <div className="hero-left">
            <motion.p className="kicker" variants={fadeUp}>
              <span className="pulse-dot" /> {isEmergency ? "URGENT RESPONSE ACTIVE" : `${greeting}, stay prepared`}
            </motion.p>
            <motion.h2 className="hero-title" variants={fadeUp}>
              {isEmergency ? "CRITICAL MODE" : "OMINA"}
            </motion.h2>
            <motion.p className="hero-sub" variants={fadeUp}>
              {isEmergency
                ? "All non-essential services disabled. Enter a query or select an immediate action below."
                : "One platform for emergency response and everyday human needs."}
            </motion.p>
            <motion.form onSubmit={runSmartSearch} className="search-bar-container hero-search" variants={fadeUp}>
              <input className="search-input" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder={isEmergency ? "Describe the emergency..." : 'Try: "someone is following me" or "cardiologist"'}
              />
              <button type="submit" className={`btn-primary ${isEmergency ? "btn-danger" : ""}`}>
                {isEmergency ? "Analyze" : "Smart Search"}
              </button>
            </motion.form>
          </div>
          <div className="hero-right">
            <motion.span className="status-indicator" variants={fadeUp} data-mode={appMode}>
              <span className="dot" />
              {isEmergency ? "Emergency mode" : "Daily life mode"}
            </motion.span>
            <motion.div className="hero-stack" variants={stagger}>
              <motion.div className="mini-card" variants={fadeUp}>
                <div><p className="mini-label">{isEmergency ? "Response" : "Immediate help"}</p><p className="mini-value">{isEmergency ? "STANDBY" : "24/7 response"}</p></div>
                {isEmergency ? <Radio size={20} /> : <Siren size={20} />}
              </motion.div>
              <motion.div className="mini-card" variants={fadeUp}>
                <div><p className="mini-label">{isEmergency ? "Network" : "Trusted providers"}</p><p className="mini-value">{isEmergency ? "SECURED" : "Verified locally"}</p></div>
                {isEmergency ? <Crosshair size={20} /> : <Stethoscope size={20} />}
              </motion.div>
              <motion.div className="mini-card" variants={fadeUp}>
                <div><p className="mini-label">{isEmergency ? "Coverage" : "Nearby coverage"}</p><p className="mini-value">{isEmergency ? "ACTIVE" : "Map + hotline"}</p></div>
                <PhoneCall size={20} />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* STATS */}
      <section className="card section-block" style={{ position: "relative", overflow: "hidden" }}>
        <div className="bg-motion-layer" />
        <div className="section-head">
          <div>
            <p className="kicker">{isEmergency ? "SITREP" : "Live insights"}</p>
            <h3 className="title">{isEmergency ? "Situation Report" : "What is happening right now"}</h3>
          </div>
          <button type="button" onClick={() => navigate("/map")}>{isEmergency ? "Tactical Map" : "Open live map"}</button>
        </div>
        <motion.div className="stat-grid" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          {insights.map((item) => (
            <motion.div key={item.id} className="stat-card" variants={fadeUp}>
              <p className="stat-label">{item.label}</p>
              <p className="stat-value">{typeof item.value === "number" ? <AnimatedCounter to={item.value} /> : item.value}</p>
              <p className="stat-hint">{item.hint}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* SMART SEARCH RESULTS */}
      <motion.section className="card" style={{ position: "relative", overflow: "hidden" }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
        <div className="bg-motion-layer" />
        <div className="section-head">
          <div>
            <p className="kicker">{isEmergency ? "INTEL" : "Smart assistance"}</p>
            <h3 className="title">{isEmergency ? "Threat Analysis" : "Ask for help in plain language"}</h3>
          </div>
        </div>
        {result ? (
          <motion.div initial={{ opacity: 0, y: 15, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="live-response-panel">
            <h3 className="title" style={{ marginBottom: "0.5rem", fontSize: "1.3rem" }}>{result.title}</h3>
            <p className="subtle" style={{ fontSize: "1rem" }}>{result.summary}</p>
            {result.mode === "emergency" ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <p style={{ fontWeight: 700, color: "#DC2626", marginTop: "1rem", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Siren size={18} /> Urgency: {result.urgency.toUpperCase()}
                </p>
                <ol style={{ margin: "0.8rem 0 0", paddingLeft: "1.4rem", color: "var(--text-primary)", fontWeight: 500 }}>
                  {result.instructions.map((item, i) => (
                    <motion.li key={item} style={{ marginBottom: "0.6rem" }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
                      {item}
                    </motion.li>
                  ))}
                </ol>
                <motion.div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", marginTop: "1.5rem" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                  <button className="btn-danger" type="button" onClick={() => navigate("/emergency")}>Open emergency help</button>
                  <button type="button" onClick={() => navigate("/map?type=police")}>Find nearest safety</button>
                </motion.div>
              </motion.div>
            ) : (
              <div className="resource-list" style={{ maxHeight: "none" }}>
                {(result.list || []).slice(0, 5).map((item) => (
                  <article key={item.id} className="resource-row" onClick={() => navigate(`/map?type=${item.type}`)}>
                    <div><strong>{item.name}</strong><p>{item.address}</p></div>
                    <span className="type-chip tone-safe">{item.type}</span>
                  </article>
                ))}
              </div>
            )}
          </motion.div>
        ) : null}
      </motion.section>

      {/* EXPLORE + NEARBY */}
      <motion.div className="explore-section section-block" style={{ marginTop: "2rem" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.5rem" }}>
            <MapPinned size={22} />
            <h3 className="title" style={{ fontSize: "1.3rem" }}>{isEmergency ? "Nearest Units" : "Explore Services"}</h3>
          </div>
          <motion.div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }} initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}>
            {DAILY_CATEGORIES.map((cat) => (
              <motion.div key={cat.id} className="card interactive" onClick={() => navigate(`/map?type=${cat.type}&search=${encodeURIComponent(cat.search)}`)}
                variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
                style={{ cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <h4 className="title" style={{ margin: 0, fontSize: "1.05rem" }}>{cat.title}</h4>
                <p className="subtle" style={{ margin: "0.2rem 0 0" }}>{cat.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.5rem" }}>
            <Shield size={22} />
            <h3 className="title" style={{ fontSize: "1.3rem" }}>{isEmergency ? "Active Response" : "Nearby (Active)"}</h3>
          </div>
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h4 className="title" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Stethoscope size={18} color="var(--accent)" /> Healthcare appointments
            </h4>
            <p className="subtle" style={{ marginBottom: "1rem" }}>Book an appointment with a nearby verified doctor or clinic.</p>
            {loadingNearby ? (
              <div className="skeleton" style={{ height: 60, width: "100%", borderRadius: "12px" }} />
            ) : dailyHealthcareProvider ? (
              <motion.div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-card)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-glass)" }}
                whileHover={{ scale: 1.01 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)" }}>{dailyHealthcareProvider.name}</p>
                  <p className="subtle" style={{ margin: "0.1rem 0 0", fontSize: "0.85rem" }}>{dailyHealthcareProvider.address}</p>
                </div>
                <button className="btn-primary" onClick={() => openBooking(dailyHealthcareProvider)}>Book</button>
              </motion.div>
            ) : (<p className="subtle">No healthcare providers found nearby right now.</p>)}
            {isGuestMode && dailyHealthcareProvider && (<p className="subtle" style={{ marginTop: "0.8rem", fontSize: "0.85rem" }}>Sign in to save bookings.</p>)}
          </div>
          <div className="card">
            <h4 className="title" style={{ marginBottom: "1rem" }}>Other Services</h4>
            <div style={{ display: "grid", gap: "0.85rem" }}>
              {loadingNearby ? (<><div className="skeleton" style={{ height: 70, borderRadius: "12px" }} /><div className="skeleton" style={{ height: 70, borderRadius: "12px" }} /></>) : nearby.length ? (
                nearby.slice(0, 4).map((item, idx) => (
                  <motion.div key={item.id} className="interactive" style={{ padding: "0.8rem 1rem", borderRadius: "12px", border: "1px solid var(--border-glass)", background: "var(--bg-card)", cursor: "pointer" }}
                    onClick={() => navigate(`/map?search=${encodeURIComponent(item.name)}`)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + idx * 0.05 }}
                    whileHover={{ scale: 1.02, boxShadow: "var(--shadow-hover)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", alignItems: "center" }}>
                      <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)" }}>{item.name}</p>
                      <span className={`type-chip ${item.type === "police" || item.type === "fire" ? "tone-danger" : item.type === "hospital" ? "tone-safe" : "tone-warning"}`}>{item.type}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>{item.address}</p>
                  </motion.div>
                ))
              ) : (<p className="subtle">No services found in this area.</p>)}
            </div>
            {nearby.length > 4 && (<button type="button" style={{ width: "100%", marginTop: "1rem" }} onClick={() => navigate("/map")}>View all on map</button>)}
          </div>
        </motion.div>
      </motion.div>

      {/* FEATURED CARDS */}
      <section className="card image-grid-section" style={{ marginTop: "2rem", position: "relative", overflow: "hidden" }}>
        <div className="bg-motion-layer" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
          <div>
            <h3 className="title">{isEmergency ? "CRITICAL ACTIONS" : "Support, organized by moments"}</h3>
            <p className="subtle" style={{ margin: 0 }}>{isEmergency ? "Select the service you need right now." : "Tap a card to jump to the right services fast."}</p>
          </div>
          <button type="button" onClick={() => navigate("/map")} className={isEmergency ? "btn-danger" : ""}>{isEmergency ? "Tactical Map" : "Open service map"}</button>
        </div>
        <div className="image-card-grid" style={{ marginTop: "1.25rem" }}>
          {(isEmergency ? EMERGENCY_GRID : DAILY_GRID).map((card, i) => (
            <motion.article key={card.id} className="image-card" onClick={() => navigate(card.to)} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }} whileHover={{ y: -6 }}>
              <div className={`media ${card.imageClass}`} aria-hidden="true">{FEATURED_SVGS[card.shape]}</div>
              <div className="content">
                <span className="tag">{card.tag}</span>
                <h4 className="title">{card.title}</h4>
                <p className="subtle">{card.description}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* BOOKING + QUICK ACTIONS */}
      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <div><h3 className="title">Healthcare booking</h3><p className="subtle" style={{ margin: 0 }}>Select provider, choose time slot, and book appointment.</p></div>
          <button type="button" className="btn-primary" onClick={() => dailyHealthcareProvider && openBooking(dailyHealthcareProvider)} disabled={!dailyHealthcareProvider}>Book appointment</button>
        </div>
        {isGuestMode ? <p className="subtle" style={{ marginTop: "0.75rem" }}>Guest mode has limited usage. Sign in to save bookings.</p> : null}
      </section>

      <BookingModal open={bookingOpen} provider={bookingProvider} onClose={() => setBookingOpen(false)} onConfirm={confirmBooking} disabled={isGuestMode} />

      <section className="card" style={{ marginTop: "1.25rem" }}>
        <h3 className="title">{isEmergency ? "Rapid Actions" : "Quick actions"}</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem", marginTop: "0.75rem" }}>
          <button type="button" className="btn-danger" onClick={() => navigate("/emergency")}><Siren size={16} />Emergency help</button>
          <button type="button" onClick={() => navigate("/map?type=hospital")}><Stethoscope size={16} />Healthcare</button>
          <button type="button" onClick={() => navigate("/map?type=police")}><Shield size={16} />Safety</button>
          <button type="button" onClick={() => navigate("/map")}><MapPinned size={16} />Explore map</button>
        </div>
      </section>
    </div>
  );
}
