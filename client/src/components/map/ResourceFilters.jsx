const types = [
  { value: "all", label: "All" },
  { value: "doctor", label: "Doctor" },
  { value: "clinic", label: "Clinic" },
  { value: "hospital", label: "Hospital" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "bloodbank", label: "Blood Bank" },
  { value: "police", label: "Police" },
  { value: "fire", label: "Fire" },
  { value: "shelter", label: "Shelter" },
  { value: "helpcenter", label: "Help Center" },
  { value: "community", label: "Community" },
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
