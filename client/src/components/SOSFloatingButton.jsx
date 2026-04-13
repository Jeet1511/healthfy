import { useState } from "react";
import { useEmergency } from "../context/EmergencyContext";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MapPin, Share2 } from "lucide-react";
import { useSOS } from "@/hooks/useSOS";
import { SOS_STATUS } from "@/context/EmergencyContext";

export default function SOSFloatingButton() {
  const { emergencyActive, appMode, location } = useEmergency();
  const {
    isHolding,
    holdProgress,
    sosStatus,
    handleMouseDown,
    handleMouseUp,
    handleTouchStart,
    handleTouchEnd,
  } = useSOS();
  const [error, setError] = useState("");
  const isEmergency = appMode === "emergency";
  const isSosActive = sosStatus === SOS_STATUS.TRIGGERED || sosStatus === SOS_STATUS.RECORDING;

  const openMap = () => {
    if (!location) return;
    window.open(`https://www.google.com/maps?q=${location.latitude},${location.longitude}`, "_blank", "noopener,noreferrer");
  };

  const shareLocation = async () => {
    if (!location) return;
    const text = `Emergency location: https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Emergency Location", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setError("");
    } catch {
      setError("Unable to share location right now.");
    }
  };

  return (
    <>
      <motion.button
        type="button"
        className={`sos-fab ${isHolding ? "holding" : ""} ${isSosActive ? "active" : ""}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onContextMenu={(event) => event.preventDefault()}
        aria-label="Trigger SOS"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        style={isEmergency ? { fontFamily: "var(--font-tactical)", letterSpacing: "0.12em" } : {}}
      >
        <span
          className="sos-hold-progress"
          aria-hidden="true"
          style={{
            background: `conic-gradient(rgba(255,255,255,0.95) ${holdProgress}%, rgba(255,255,255,0.16) ${holdProgress}% 100%)`,
            opacity: isHolding ? 1 : 0,
          }}
        />
        <span className="sos-fab-label">{isSosActive ? "SOS" : "HOLD"}</span>
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
