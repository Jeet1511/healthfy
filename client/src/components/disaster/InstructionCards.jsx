export default function InstructionCards({ instructions }) {
  return (
    <section className="card">
      <h3 className="title">Safety Instructions</h3>
      <div className="instruction-cards">
        {instructions.map((instruction, index) => (
          <article key={instruction} className="instruction-card">
            <span>Step {index + 1}</span>
            <p>{instruction}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
