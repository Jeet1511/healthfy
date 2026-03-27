"use client";

import { motion } from "framer-motion";
import { EmergencyResponse } from "@/backend/types";

type ActionPanelProps = {
  triage: EmergencyResponse | null;
  onAction: (action: string) => void;
  onActivateCrisis: () => void;
};

const emergencyContacts = [
  { label: "Call Ambulance", number: "108", distance: "2.4 km", action: "Call Ambulance" },
  { label: "Notify Police", number: "100", distance: "3.1 km", action: "Notify Police" },
  { label: "Fire Brigade", number: "101", distance: "4.7 km", action: "Fire Brigade" },
];

export function ActionPanel({ triage, onAction, onActivateCrisis }: ActionPanelProps) {
  return (
    <section className="panel-shell">
      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Rapid Response</p>
        <h3 className="text-lg font-semibold text-slate-100">Action Panel</h3>
      </div>

      <div className="space-y-2">
        {emergencyContacts.map((contact) => (
          <motion.button
            key={contact.label}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => onAction(contact.action)}
            className="action-btn"
          >
            <div>
              <p className="text-sm font-medium text-slate-100">{contact.label}</p>
              <p className="text-xs text-slate-400">Nearest unit: {contact.distance}</p>
            </div>
            <p className="text-sm font-semibold text-slate-200">{contact.number}</p>
          </motion.button>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/30 p-3 text-sm text-slate-300">
        Current AI classification: <span className="font-semibold text-slate-100">{triage?.urgency ?? "Awaiting input"}</span>
      </div>

      <button type="button" className="mt-4 w-full crisis-btn" onClick={onActivateCrisis}>
        Activate Crisis Mode
      </button>
    </section>
  );
}
