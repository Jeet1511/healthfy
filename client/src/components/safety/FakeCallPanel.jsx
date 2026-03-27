import { useState } from "react";

export default function FakeCallPanel() {
  const [calling, setCalling] = useState(false);

  return (
    <section className="card">
      <h3 className="title">Fake Call</h3>
      <p className="subtle">Quick social safety call screen for high-risk moments.</p>
      <div className="fake-call-box">
        <strong>Incoming call: Safety Contact</strong>
        <span>{calling ? "Connected..." : "Tap to simulate incoming call UI"}</span>
      </div>
      <button type="button" className="btn-warning" onClick={() => setCalling((prev) => !prev)}>
        {calling ? "End Call" : "Start Fake Call"}
      </button>
    </section>
  );
}
