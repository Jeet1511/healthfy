import { useEffect, useState } from "react";
import { useEmergency } from "@/context/EmergencyContext";
import { AlertTriangle, MapPin, TrendingUp, Radio } from "lucide-react";
import {
  checkDangerZone,
  getNearbyDangerZones,
  getSafetyRecommendations,
  getRiskLevel,
  reportDangerZone,
} from "@/services/dangerZoneService";
import "./DangerZonePanel.css";

export default function DangerZonePanel() {
  const { location, addStatusLog } = useEmergency();
  const [dangerCheck, setDangerCheck] = useState(null);
  const [nearbyZones, setNearbyZones] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [riskLevel, setRiskLevel] = useState(0);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportText, setReportText] = useState("");

  useEffect(() => {
    if (!location) return;

    const check = checkDangerZone(location.latitude, location.longitude);
    setDangerCheck(check);

    const nearby = getNearbyDangerZones(location.latitude, location.longitude, 2);
    setNearbyZones(nearby);

    const recs = getSafetyRecommendations(location.latitude, location.longitude);
    setRecommendations(recs);

    const risk = getRiskLevel(
      check.zone?.severity || "safe",
      check.timeOfDay
    );
    setRiskLevel(risk);

    // Alert user if entering danger zone
    if (check.inDanger) {
      addStatusLog(`⚠️ DANGER ZONE: ${check.zone.name}`, "warning");
    }
  }, [location, addStatusLog]);

  const handleReportDanger = () => {
    if (!reportText.trim()) return;

    reportDangerZone(location.latitude, location.longitude, reportText);
    addStatusLog("📍 Danger zone reported to community", "success");
    setReportText("");
    setShowReportForm(false);
  };

  if (!location) {
    return null;
  }

  return (
    <section className="danger-zone-panel">
      <div className="panel-header">
        <h3 className="title">🗺️ Danger Zone Detection</h3>
        <div className={`risk-badge risk-${dangerCheck?.zone?.severity || "safe"}`}>
          Risk: {riskLevel}%
        </div>
      </div>

      {dangerCheck?.inDanger && (
        <div className="danger-alert alert-danger">
          <AlertTriangle size={20} />
          <div>
            <strong>⚠️ WARNING: Danger Zone Detected</strong>
            <p>{dangerCheck.zone.name}</p>
            <small>{dangerCheck.zone.description}</small>
          </div>
        </div>
      )}

      <div className="risk-meter">
        <div className="meter-label">
          <span>Safe</span>
          <span>Moderate</span>
          <span>Dangerous</span>
        </div>
        <div className="meter-bar">
          <div className="meter-fill" style={{ width: `${riskLevel}%` }}></div>
          <div className="meter-indicator" style={{ left: `${riskLevel}%` }}></div>
        </div>
        <div className="meter-value">{riskLevel}%</div>
      </div>

      {recommendations.length > 0 && (
        <div className="recommendations">
          <h4>Safety Recommendations</h4>
          {recommendations.map((rec, idx) => (
            <div key={idx} className={`rec-item rec-${rec.level}`}>
              <div className="rec-header">
                <strong>{rec.message}</strong>
              </div>
              <p className="rec-details">{rec.details}</p>
              <p className="rec-action">→ {rec.action}</p>
            </div>
          ))}
        </div>
      )}

      {nearbyZones.length > 0 && (
        <div className="nearby-zones">
          <h4>Nearby Danger Zones ({nearbyZones.length})</h4>
          <div className="zones-list">
            {nearbyZones.slice(0, 5).map((zone) => (
              <div key={zone.id} className={`zone-item zone-${zone.severity}`}>
                <div className="zone-icon">
                  {zone.severity === "danger" && "🔴"}
                  {zone.severity === "warning" && "🟠"}
                  {zone.severity === "caution" && "🟡"}
                  {zone.severity === "safe" && "🟢"}
                </div>
                <div className="zone-info">
                  <strong>{zone.name}</strong>
                  <small>{zone.description}</small>
                  <p className="distance">
                    {(zone.distance * 1000).toFixed(0)}m away
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="zone-actions">
        <button
          className="btn-report"
          onClick={() => setShowReportForm(!showReportForm)}
        >
          <Radio size={16} />
          {showReportForm ? "Cancel" : "Report Danger"}
        </button>
      </div>

      {showReportForm && (
        <div className="report-form">
          <textarea
            placeholder="Describe the danger or unsafe situation you observed..."
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            rows={4}
          />
          <button className="btn-submit" onClick={handleReportDanger}>
            Submit Report
          </button>
        </div>
      )}

      <div className="zone-info-box">
        <p>
          ℹ️ Risk levels are based on crime data, user reports, and time of day. Always stay alert
          and trust your instincts.
        </p>
      </div>
    </section>
  );
}
