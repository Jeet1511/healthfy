const types = [
  { value: "all", label: "All" },
  { value: "hospital", label: "Hospital" },
  { value: "police", label: "Police" },
  { value: "fire", label: "Fire" },
  { value: "shelter", label: "Shelter" },
];

export default function ResourceFilters({ type, search, onTypeChange, onSearchChange }) {
  return (
    <section className="card">
      <h3 className="title">Map Filters</h3>
      <p className="subtle">Filter response resources by type and location keywords.</p>
      <div className="filters-grid">
        <select value={type} onChange={(event) => onTypeChange(event.target.value)}>
          {types.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name/address"
        />
      </div>
    </section>
  );
}
