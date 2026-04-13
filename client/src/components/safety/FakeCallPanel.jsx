import { useEffect, useRef, useState } from "react";
import { PhoneCall, PhoneIncoming, PhoneOff, User } from "lucide-react";

const DEFAULT_DELAY = 10;

export default function FakeCallPanel() {
  const [callerName, setCallerName] = useState("Safety Contact");
  const [delaySeconds, setDelaySeconds] = useState(DEFAULT_DELAY);
  const [scheduled, setScheduled] = useState(false);
  const [ringing, setRinging] = useState(false);
  const [connected, setConnected] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const scheduleFakeCall = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setScheduled(true);
    setRinging(false);
    setConnected(false);

    timerRef.current = setTimeout(() => {
      setScheduled(false);
      setRinging(true);
      if (navigator.vibrate) {
        navigator.vibrate([300, 120, 300]);
      }
    }, Number(delaySeconds) * 1000);
  };

  const cancelFakeCall = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setScheduled(false);
    setRinging(false);
    setConnected(false);
  };

  const acceptCall = () => {
    setRinging(false);
    setConnected(true);
  };

  const endCall = () => {
    setConnected(false);
  };

  return (
    <section className="card">
      <h3 className="title">Fake Call</h3>
      <p className="subtle">Quick social safety call screen for high-risk moments.</p>

      <div style={{ display: "grid", gap: "0.7rem", marginBottom: "0.9rem" }}>
        <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.85rem" }}>
          <span style={{ fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <User size={14} />
            Caller Name
          </span>
          <input
            type="text"
            value={callerName}
            onChange={(event) => setCallerName(event.target.value || "Safety Contact")}
            maxLength={40}
            aria-label="Fake caller name"
          />
        </label>

        <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.85rem" }}>
          <span style={{ fontWeight: 600 }}>Delay before incoming call</span>
          <select
            value={delaySeconds}
            onChange={(event) => setDelaySeconds(Number(event.target.value))}
            aria-label="Fake call delay"
          >
            <option value={5}>5 seconds</option>
            <option value={10}>10 seconds</option>
            <option value={20}>20 seconds</option>
            <option value={30}>30 seconds</option>
          </select>
        </label>
      </div>

      <div className="fake-call-box" style={{ marginBottom: "0.9rem" }}>
        <strong>Incoming call: {callerName}</strong>
        <span>
          {connected
            ? "Connected. Stay calm and speak naturally."
            : ringing
              ? "Incoming call now. Accept or decline."
              : scheduled
                ? `Fake call scheduled in ${delaySeconds}s.`
                : "Tap Start to simulate incoming call UI."}
        </span>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {!scheduled && !ringing && !connected && (
          <button type="button" className="btn-warning" onClick={scheduleFakeCall}>
            <PhoneCall size={16} />
            Start Fake Call
          </button>
        )}

        {scheduled && (
          <button type="button" className="btn-warning" onClick={cancelFakeCall}>
            <PhoneOff size={16} />
            Cancel
          </button>
        )}

        {ringing && (
          <>
            <button
              type="button"
              className="btn-warning"
              onClick={acceptCall}
              style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff" }}
            >
              <PhoneIncoming size={16} />
              Accept
            </button>
            <button type="button" className="btn-warning" onClick={cancelFakeCall}>
              <PhoneOff size={16} />
              Decline
            </button>
          </>
        )}

        {connected && (
          <button type="button" className="btn-warning" onClick={endCall}>
            <PhoneOff size={16} />
            End Call
          </button>
        )}
      </div>
    </section>
  );
}
