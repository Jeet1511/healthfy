"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CRISIS_PLAYBOOKS } from "@/backend/data/mockData";
import { CrisisScenario } from "@/backend/types";

type CrisisModeOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
};

const scenarios: CrisisScenario[] = ["Accident", "Fire", "Explosion"];

export function CrisisModeOverlay({ isOpen, onClose }: CrisisModeOverlayProps) {
  const [selected, setSelected] = useState<CrisisScenario>("Accident");

  const playbook = useMemo(
    () => CRISIS_PLAYBOOKS.find((item) => item.scenario === selected),
    [selected],
  );

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-sm"
        >
          <div className="mx-auto flex h-full max-w-6xl flex-col px-4 py-6 md:px-8 md:py-10">
            <div className="panel-shell flex h-full flex-col">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-rose-600">Critical Protocol</p>
                  <h2 className="text-2xl font-semibold text-slate-900">Crisis Mode Activated</h2>
                </div>
                <button type="button" onClick={onClose} className="quick-pill">
                  Exit Crisis Mode
                </button>
              </div>

              <div className="mb-5 flex flex-wrap gap-2">
                {scenarios.map((scenario) => (
                  <button
                    key={scenario}
                    type="button"
                    onClick={() => setSelected(scenario)}
                    className={`rounded-lg px-3 py-2 text-sm transition ${
                      selected === scenario
                        ? "bg-rose-500/80 text-white"
                        : "border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {scenario}
                  </button>
                ))}
              </div>

              <div className="grid flex-1 gap-4 lg:grid-cols-5">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 lg:col-span-3">
                  <h3 className="mb-3 text-lg font-semibold text-slate-900">Step-by-step actions</h3>
                  <ol className="space-y-2 text-sm text-slate-700">
                    {playbook?.actions.map((action, index) => (
                      <li key={action}>
                        <span className="font-semibold text-rose-600">Step {index + 1}:</span> {action}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 lg:col-span-2">
                  <h3 className="mb-3 text-lg font-semibold text-slate-900">Emergency contacts</h3>
                  <div className="space-y-2 text-sm text-slate-700">
                    <p>Ambulance: <span className="font-semibold text-slate-900">{playbook?.emergencyContacts.ambulance}</span></p>
                    <p>Police: <span className="font-semibold text-slate-900">{playbook?.emergencyContacts.police}</span></p>
                    <p>Fire: <span className="font-semibold text-slate-900">{playbook?.emergencyContacts.fire}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
