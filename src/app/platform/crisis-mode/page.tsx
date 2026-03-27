"use client";

import { useMemo, useState } from "react";
import { CRISIS_PLAYBOOKS } from "@/backend/data/mockData";
import { CrisisScenario } from "@/backend/types";

const scenarios: CrisisScenario[] = ["Accident", "Fire", "Explosion"];

export default function CrisisModePage() {
  const [selected, setSelected] = useState<CrisisScenario>("Accident");
  const playbook = useMemo(
    () => CRISIS_PLAYBOOKS.find((item) => item.scenario === selected),
    [selected],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <section className="panel-shell border-rose-400/40 bg-linear-to-br from-rose-950/35 to-slate-900/40 lg:col-span-3">
        <p className="text-xs uppercase tracking-[0.2em] text-rose-200/80">High Priority</p>
        <h3 className="mt-1 text-2xl font-semibold text-rose-100">Crisis Mode</h3>

        <div className="mt-4 flex flex-wrap gap-2">
          {scenarios.map((scenario) => (
            <button
              key={scenario}
              type="button"
              onClick={() => setSelected(scenario)}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                selected === scenario
                  ? "bg-rose-500/80 text-white"
                  : "border border-white/20 text-slate-200 hover:bg-white/10"
              }`}
            >
              {scenario}
            </button>
          ))}
        </div>

        <ol className="mt-5 space-y-2 text-sm text-rose-50/90">
          {playbook?.actions.map((action, index) => (
            <li key={action}>
              <span className="font-semibold text-rose-200">Step {index + 1}:</span> {action}
            </li>
          ))}
        </ol>
      </section>

      <section className="panel-shell lg:col-span-2">
        <h4 className="text-lg font-semibold text-slate-100">Emergency Controls</h4>
        <div className="mt-4 space-y-2">
          <button type="button" className="crisis-btn w-full">Call Ambulance · {playbook?.emergencyContacts.ambulance}</button>
          <button type="button" className="crisis-btn w-full">Notify Police · {playbook?.emergencyContacts.police}</button>
          <button type="button" className="crisis-btn w-full">Fire Brigade · {playbook?.emergencyContacts.fire}</button>
        </div>
      </section>
    </div>
  );
}
