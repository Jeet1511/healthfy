import { useEffect, useState } from "react";
import { MapPin, AlertCircle, Loader } from "lucide-react";
import { useEmergency } from "@/context/EmergencyContext";

export default function LiveTrackingPanel() {
  const { location } = useEmergency();
  const [isLoading, setIsLoading] = useState(!location);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!location) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [location]);

  if (error) {
    return (
      <section className="card">
        <h3 className="title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <AlertCircle size={20} style={{ color: "#ef4444" }} />
          Location Error
        </h3>
        <p className="subtle">{error}</p>
      </section>
    );
  }

  return (
    <section className="card">
      <h3 className="title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <MapPin size={20} />
        Live Location Tracking
      </h3>
      <p className="subtle">Real-time GPS coordinates for emergency response.</p>

      {isLoading ? (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <Loader size={24} className="spin" style={{ margin: "0 auto", animation: "spin 1s linear infinite" }} />
          <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#666" }}>Acquiring location...</p>
        </div>
      ) : location ? (
        <div className="tracking-grid">
          <div>
            <small style={{ fontWeight: "600", color: "#666" }}>Latitude</small>
            <p style={{ fontSize: "1.2rem", fontFamily: "monospace", fontWeight: "bold" }}>
              {location.latitude.toFixed(6)}
            </p>
          </div>
          <div>
            <small style={{ fontWeight: "600", color: "#666" }}>Longitude</small>
            <p style={{ fontSize: "1.2rem", fontFamily: "monospace", fontWeight: "bold" }}>
              {location.longitude.toFixed(6)}
            </p>
          </div>
          <div>
            <small style={{ fontWeight: "600", color: "#666" }}>Accuracy</small>
            <p style={{ fontSize: "1rem" }}>±{location.accuracy?.toFixed(1) || "?"}m</p>
          </div>
          <div>
            <small style={{ fontWeight: "600", color: "#666" }}>Status</small>
            <p style={{ color: "#10b981", fontWeight: "bold" }}>🟢 Active</p>
          </div>
        </div>
      ) : (
        <div style={{ padding: "1rem", color: "#666", textAlign: "center" }}>
          <p>Location not available. Enable location access in settings.</p>
        </div>
      )}
    </section>
  );
}
