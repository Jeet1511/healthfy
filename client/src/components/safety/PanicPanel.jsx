export default function PanicPanel({ onTrigger, active }) {
  return (
    <section className="card">
      <h3 className="title">Panic Access</h3>
      <p className="subtle">One-tap emergency trigger for immediate response mode.</p>
      <button type="button" className={`btn-danger ${active ? "btn-danger-active" : ""}`} onClick={onTrigger}>
        {active ? "PANIC TRIGGERED" : "PANIC BUTTON"}
      </button>
    </section>
  );
}
