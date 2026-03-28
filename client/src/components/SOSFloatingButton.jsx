import { useState } from "react";
import { useEmergency } from "../context/EmergencyContext";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MapPin, Share2 } from "lucide-react";

export default function SOSFloatingButton() {
  const { emergencyActive, enterEmergencyMode, appMode, location, setLocation } = useEmergency();
  const [error, setError] = useState("");
  const isEmergency = appMode === "emergency";

  const getLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error("Geolocation not supported.")); return; }
      navigator.geolocation.getCurrentPosition((p) => resolve(p), () => reject(new Error("Unable to fetch location.")), { enableHighAccuracy: true, timeout: 10000 });
    });

  const triggerEmergency = async () => {
    setError("");
    enterEmergencyMode();
    try {
      const position = await getLocation();
      setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
    } catch (err) { setError(err.message || "Location unavailable"); }
  };

  const openMap = () => {
    if (!location) return;
    window.open(`https://www.google.com/maps?q=${location.latitude},${location.longitude}`, "_blank", "noopener,noreferrer");
  };

  const shareLocation = async () => {
    if (!location) return;
    const text = `Emergency location: https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    if (navigator.share) { await navigator.share({ title: "Emergency Location", text }); return; }
    await navigator.clipboard.writeText(text);
  };

  return (
    <>
      <motion.button
        type="button"
        className="sos-fab"
        onClick={triggerEmergency}
        aria-label="Trigger SOS"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        style={isEmergency ? { fontFamily: "var(--font-tactical)", letterSpacing: "0.12em" } : {}}
      >
        SOS
      </motion.button>

      <AnimatePresence>
        {emergencyActive && (
          <motion.section
            className="sos-panel card"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <h3 style={{ fontFamily: "var(--font-tactical)", letterSpacing: "0.06em", fontSize: "1rem" }}>
              Emergency Mode Active
            </h3>
            {location ? (
              <p className="muted" style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>
                LOC: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              </p>
            ) : (
              <p className="muted" style={{ fontFamily: "var(--font-mono)" }}>Acquiring location...</p>
            )}
            {error ? <p className="sos-error">{error}</p> : null}

            <div className="sos-actions">
              <a className="sos-action" href="tel:112" style={{ fontFamily: "var(--font-mono)" }}>
                <Phone size={14} /> Call Police
              </a>
              <button type="button" className="sos-action" onClick={shareLocation} disabled={!location} style={{ fontFamily: "var(--font-mono)" }}>
                <Share2 size={14} /> Share Location
              </button>
              <button type="button" className="sos-action" onClick={openMap} disabled={!location} style={{ fontFamily: "var(--font-mono)" }}>
                <MapPin size={14} /> Open Map
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
