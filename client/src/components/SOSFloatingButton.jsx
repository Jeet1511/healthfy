import { useState } from "react";
import { useEmergency } from "../context/EmergencyContext";

export default function SOSFloatingButton() {
  const { emergencyActive, setEmergencyActive, location, setLocation } = useEmergency();
  const [error, setError] = useState("");

  const getLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported in this browser."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        () => reject(new Error("Unable to fetch location.")),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });

  const triggerEmergency = async () => {
    const confirmed = window.confirm("Trigger emergency mode now?");
    if (!confirmed) {
      return;
    }

    setError("");
    setEmergencyActive(true);

    try {
      const position = await getLocation();
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (err) {
      setError(err.message || "Location unavailable");
    }
  };

  const openMap = () => {
    if (!location) return;
    const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareLocation = async () => {
    if (!location) return;
    const text = `Emergency location: https://www.google.com/maps?q=${location.latitude},${location.longitude}`;

    if (navigator.share) {
      await navigator.share({ title: "Emergency Location", text });
      return;
    }

    await navigator.clipboard.writeText(text);
  };

  return (
    <>
      <button
        type="button"
        className={`sos-fab ${emergencyActive ? "sos-fab-active" : ""}`}
        onClick={triggerEmergency}
        aria-label="Trigger SOS"
      >
        SOS
      </button>

      {emergencyActive ? (
        <section className="sos-panel card">
          <h3>Emergency Mode Active</h3>
          {location ? (
            <p className="muted">
              Location: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
            </p>
          ) : (
            <p className="muted">Fetching location...</p>
          )}
          {error ? <p className="sos-error">{error}</p> : null}

          <div className="sos-actions">
            <a className="sos-action" href="tel:112">
              Call Police
            </a>
            <button type="button" className="sos-action" onClick={shareLocation} disabled={!location}>
              Share Location
            </button>
            <button type="button" className="sos-action" onClick={openMap} disabled={!location}>
              Open Map
            </button>
          </div>
        </section>
      ) : null}
    </>
  );
}
