import { useEffect } from "react";
import { useEmergency } from "../context/EmergencyContext";
import FakeCallPanel from "../components/safety/FakeCallPanel";
import LiveTrackingPanel from "../components/safety/LiveTrackingPanel";
import PanicPanel from "../components/safety/PanicPanel";

export default function SafetyPage() {
  const { emergencyActive, setEmergencyActive, setCurrentContext } = useEmergency();

  useEffect(() => {
    setCurrentContext("safety");
  }, [setCurrentContext]);

  return (
    <>
      <section className="hero card">
        <h2 className="title">Safety Mode</h2>
        <p className="subtle">Minimal, instant-access controls for personal safety emergencies.</p>
      </section>

      <div className="grid">
        <PanicPanel onTrigger={() => setEmergencyActive(true)} active={emergencyActive} />
        <FakeCallPanel />
      </div>

      <div className="grid">
        <LiveTrackingPanel />
        <section className="card">
          <h3 className="title">Emergency Calls</h3>
          <p className="subtle">Direct emergency dial options for immediate intervention.</p>
          <a className="btn-danger" href="tel:112">Call Police</a>
        </section>
      </div>
    </>
  );
}
