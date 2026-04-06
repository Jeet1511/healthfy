/**
 * InfoSection.jsx
 * Display information about what the system does
 */

import { Info, Mic, MapPin, Video, Phone } from "lucide-react";
import "./InfoSection.css";

export default function InfoSection() {
  const features = [
    {
      icon: Mic,
      title: "Auto Audio Recording",
      description: "Automatically records audio from your microphone to capture evidence"
    },
    {
      icon: Video,
      title: "Auto Video Recording",
      description: "Records video from your device camera when available"
    },
    {
      icon: MapPin,
      title: "Live Location Tracking",
      description: "Continuously sends your GPS location to emergency contacts"
    },
    {
      icon: Phone,
      title: "Emergency Alerts",
      description: "Notifies emergency contacts and nearest emergency services"
    }
  ];

  return (
    <section className="info-section card">
      <h3 className="title" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
        <Info size={20} />
        What Happens When Activated
      </h3>

      <div className="features-grid">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="feature-card">
              <Icon size={24} className="feature-icon" />
              <h4>{feature.title}</h4>
              <p>{feature.description}</p>
            </div>
          );
        })}
      </div>

      <div className="important-note">
        <strong>⚠️ Important:</strong> Only trigger SOS in genuine emergencies. False alarms waste emergency resources and may be penalized by law.
      </div>
    </section>
  );
}
