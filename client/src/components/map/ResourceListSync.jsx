const typeTone = {
  hospital: "tone-safe",
  police: "tone-warning",
  fire: "tone-danger",
  shelter: "tone-safe",
};

export default function ResourceListSync({ resources, selectedId, onSelect, onHover, loading }) {
  return (
    <section className="card map-list interactive">
      <h3 className="title" style={{ padding: "0 0.5rem" }}>Nearby Units</h3>
      <div className="resource-list" style={{ paddingRight: "10px" }}>
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="card interactive" style={{ padding: "1rem", marginBottom: "0.5rem" }}>
              <div className="skeleton" style={{ height: "1.2rem", width: "60%", marginBottom: "0.5rem", borderRadius: "4px" }} />
              <div className="skeleton" style={{ height: "0.8rem", width: "40%", borderRadius: "4px" }} />
            </div>
          ))
        ) : resources.length === 0 ? (
          <p className="subtle" style={{ padding: "1rem" }}>No nearby units matching your filters.</p>
        ) : (
          resources.map((item) => (
            <article
              key={item.id}
              className={`resource-row ${selectedId === item.id ? "resource-row-active" : ""}`}
              onClick={() => onSelect(item.id)}
              onMouseEnter={() => onHover && onHover(item.id)}
              onMouseLeave={() => onHover && onHover("")}
              style={{ marginBottom: "0.5rem" }}
            >
              <div>
                <strong style={{ color: selectedId === item.id ? "#fff" : "#e2e8f0" }}>{item.name}</strong>
                <p className="subtle" style={{ margin: "4px 0", fontSize: "0.9rem" }}>{item.address}</p>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#3b82f6" }}>{item.distanceKm} km away</p>
              </div>
              <span className={`type-chip ${typeTone[item.type]}`} style={{ fontSize: "0.75rem", padding: "4px 8px", borderRadius: "99px" }}>{item.type}</span>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
