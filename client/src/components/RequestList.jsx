export default function RequestList({ items }) {
  return (
    <section className="card">
      <h2>Recent Requests</h2>
      <div className="list">
        {items.length === 0 ? <p className="muted">No requests yet.</p> : null}
        {items.map((item) => (
          <article key={item._id} className="list-item">
            <header>
              <strong>{item.name}</strong>
              <span>{item.category}</span>
            </header>
            <p>{item.message}</p>
            <footer>
              <small>{item.email}</small>
              <small>{item.status}</small>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}
