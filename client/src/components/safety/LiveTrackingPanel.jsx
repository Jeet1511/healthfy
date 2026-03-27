import { useEffect, useState } from "react";

export default function LiveTrackingPanel() {
  const [mockPoint, setMockPoint] = useState({ latitude: 28.6139, longitude: 77.209 });

  useEffect(() => {
    const interval = setInterval(() => {
      setMockPoint((prev) => ({
        latitude: Number((prev.latitude + (Math.random() - 0.5) * 0.0008).toFixed(6)),
        longitude: Number((prev.longitude + (Math.random() - 0.5) * 0.0008).toFixed(6)),
      }));
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="card">
      <h3 className="title">Live Tracking (Mock)</h3>
      <p className="subtle">Continuously updates your route point for rapid support coordination.</p>
      <div className="tracking-grid">
        <div>
          <small>Latitude</small>
          <p>{mockPoint.latitude}</p>
        </div>
        <div>
          <small>Longitude</small>
          <p>{mockPoint.longitude}</p>
        </div>
      </div>
    </section>
  );
}
