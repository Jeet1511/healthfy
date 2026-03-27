export default function SafeZonesList({ zones }) {
  return (
    <section className="card">
      <h3 className="title">Safe Zones</h3>
      <ul className="safe-zones-list">
        {zones.map((zone) => (
          <li key={zone}>{zone}</li>
        ))}
      </ul>
    </section>
  );
}
