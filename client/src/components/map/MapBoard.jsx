const typeTone = {
  hospital: "tone-safe",
  police: "tone-warning",
  fire: "tone-danger",
  shelter: "tone-safe",
};

function scale(resources, value, key) {
  const values = resources.map((item) => item[key]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return 50;
  return ((value - min) / (max - min)) * 80 + 10;
}

export default function MapBoard({ resources, selectedId, onSelect }) {
  if (!resources.length) {
    return (
      <section className="card map-board-empty">
        <p className="subtle">No resources found for current filters.</p>
      </section>
    );
  }

  return (
    <section className="card map-board">
      {resources.map((item) => {
        const left = scale(resources, item.longitude, "longitude");
        const top = 100 - scale(resources, item.latitude, "latitude");
        const active = selectedId === item.id;

        return (
          <button
            key={item.id}
            type="button"
            className={`map-marker ${typeTone[item.type]} ${active ? "map-marker-active" : ""}`}
            style={{ left: `${left}%`, top: `${top}%` }}
            onClick={() => onSelect(item.id)}
            title={item.name}
          >
            {item.type.slice(0, 1).toUpperCase()}
          </button>
        );
      })}
    </section>
  );
}
