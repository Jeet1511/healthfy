import { useEffect, useState } from "react";
import { useEmergency } from "@/context/EmergencyContext";
import { MapPin, AlertCircle, Share2, Navigation } from "lucide-react";
import { getMockEmergencyLocations, generateLocationShareLink } from "@/services/locationService";
import "./LocationTracker.css";

export default function LocationTracker() {
  const { location, sosStatus, sosTriggeredAt } = useEmergency();
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const [selectedNavigation, setSelectedNavigation] = useState(null);

  useEffect(() => {
    if (location) {
      // Get mock emergency locations nearby
      const nearby = getMockEmergencyLocations(location.latitude, location.longitude);
      setNearbyLocations(nearby);
    }
  }, [location]);

  if (!location) {
    return (
      <section className="location-tracker">
        <div className="location-header">
          <h3 className="title">📍 Live Location</h3>
        </div>
        <div className="location-loading">
          <AlertCircle size={24} />
          <p>Acquiring location...</p>
        </div>
      </section>
    );
  }

  const shareLink = generateLocationShareLink(location.latitude, location.longitude);

  return (
    <section className="location-tracker">
      <div className="location-header">
        <h3 className="title">📍 Live Location</h3>
        {sosTriggeredAt && (
          <span className="sos-badge">SOS Active</span>
        )}
      </div>

      <div className="location-map-placeholder">
        <div className="map-container">
          {/* In production, use Google Maps or Mapbox */}
          <iframe
            width="100%"
            height="300"
            style={{ border: 0, borderRadius: "8px" }}
            loading="lazy"
            allowFullScreen=""
            src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_KEY&q=${location.latitude},${location.longitude}`}
          ></iframe>
        </div>
      </div>

      <div className="location-coordinates">
        <div className="coord-row">
          <span>Latitude</span>
          <span className="value">{location.latitude.toFixed(6)}</span>
        </div>
        <div className="coord-row">
          <span>Longitude</span>
          <span className="value">{location.longitude.toFixed(6)}</span>
        </div>
        <div className="coord-row">
          <span>Accuracy</span>
          <span className="value">{location.accuracy?.toFixed(1)}m</span>
        </div>
        {location.speed && (
          <div className="coord-row">
            <span>Speed</span>
            <span className="value">{(location.speed * 3.6).toFixed(1)} km/h</span>
          </div>
        )}
      </div>

      <div className="location-actions">
        <a
          href={shareLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-action share"
        >
          <Share2 size={18} />
          Share Location
        </a>
      </div>

      {nearbyLocations.length > 0 && (
        <div className="nearby-locations">
          <h4>Nearby Emergency Services</h4>
          <div className="locations-list">
            {nearbyLocations.map((loc) => (
              <div key={loc.id} className={`location-item ${loc.type}`}>
                <div className="location-badge" data-type={loc.type}>
                  {loc.type === "hospital" && "🏥"}
                  {loc.type === "police" && "🚔"}
                  {loc.type === "fire" && "🚒"}
                </div>
                <div className="location-details">
                  <strong>{loc.name}</strong>
                  <p className="distance">{loc.distance.toFixed(1)} km away</p>
                </div>
                <button
                  className="btn-navigate"
                  onClick={() => {
                    const navLink = `https://maps.google.com/?q=${loc.latitude},${loc.longitude}`;
                    window.open(navLink, "_blank");
                  }}
                >
                  <Navigation size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="location-info">
        <p>Your live location is being tracked and shared with emergency contacts.</p>
      </div>
    </section>
  );
}
