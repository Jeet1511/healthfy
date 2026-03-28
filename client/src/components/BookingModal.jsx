import { useMemo, useState } from "react";

const DEFAULT_SLOTS = ["09:00 AM", "11:30 AM", "02:00 PM", "04:30 PM", "06:00 PM"];

export default function BookingModal({
  open,
  provider,
  onClose,
  onConfirm,
  disabled,
}) {
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState(DEFAULT_SLOTS[0]);
  const [note, setNote] = useState("");

  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  if (!open || !provider) return null;

  const submit = (event) => {
    event.preventDefault();
    if (!date) return;
    onConfirm({
      providerId: provider.id,
      providerName: provider.name,
      type: provider.type,
      address: provider.address,
      date,
      slot,
      note,
      status: "confirmed",
    });
    setDate("");
    setSlot(DEFAULT_SLOTS[0]);
    setNote("");
  };

  return (
    <div className="booking-backdrop" onClick={onClose}>
      <section className="booking-modal" onClick={(event) => event.stopPropagation()}>
        <h3 className="title">Book appointment</h3>
        <p className="subtle" style={{ marginBottom: "1rem" }}>
          {provider.name} • {provider.address}
        </p>

        <form onSubmit={submit} className="booking-form">
          <label>
            Date
            <input
              type="date"
              min={minDate}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>

          <label>
            Time slot
            <select value={slot} onChange={(event) => setSlot(event.target.value)}>
              {DEFAULT_SLOTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            Note (optional)
            <textarea
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Add symptoms or preferences"
            />
          </label>

          <div className="booking-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={disabled}>
              Confirm booking
            </button>
          </div>
          {disabled ? (
            <p className="subtle" style={{ marginTop: "0.75rem" }}>
              Sign in to complete booking and save it in your profile.
            </p>
          ) : null}
        </form>
      </section>
    </div>
  );
}
