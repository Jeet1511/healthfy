export default function DisasterSelector({ value, onChange, options }) {
  return (
    <section className="card">
      <h3 className="title">Disaster Selector</h3>
      <p className="subtle">Choose active disaster type for specific instructions and safe zones.</p>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((item) => (
          <option key={item.value} value={item.value}>{item.label}</option>
        ))}
      </select>
    </section>
  );
}
