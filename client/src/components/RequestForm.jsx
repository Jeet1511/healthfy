import { useState } from "react";

const initialState = {
  name: "",
  email: "",
  category: "General",
  message: "",
};

export default function RequestForm({ onSubmit, loading }) {
  const [form, setForm] = useState(initialState);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    await onSubmit(form);
    setForm(initialState);
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2>Create Assistance Request</h2>
      <input
        value={form.name}
        onChange={(event) => update("name", event.target.value)}
        placeholder="Full name"
        required
      />
      <input
        value={form.email}
        type="email"
        onChange={(event) => update("email", event.target.value)}
        placeholder="Email"
        required
      />
      <select value={form.category} onChange={(event) => update("category", event.target.value)}>
        <option>General</option>
        <option>Medical</option>
        <option>Emergency</option>
        <option>Logistics</option>
      </select>
      <textarea
        value={form.message}
        onChange={(event) => update("message", event.target.value)}
        placeholder="Describe required assistance"
        rows={4}
        required
      />
      <button disabled={loading} type="submit">
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
