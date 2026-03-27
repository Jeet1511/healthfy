"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ResourceWithDistance } from "@/backend/types";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

type BloodFinderPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function BloodFinderPanel({ isOpen, onClose }: BloodFinderPanelProps) {
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [results, setResults] = useState<ResourceWithDistance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const query = new URLSearchParams({
      bloodGroup,
      maxDistanceKm: "35",
    });

    fetch(`/api/resources?${query.toString()}`)
      .then((response) => response.json())
      .then((data) => {
        const list = (data.resources ?? []) as ResourceWithDistance[];
        setResults(
          list.filter((resource) => resource.type === "Blood Bank" || resource.type === "Hospital"),
        );
      })
      .finally(() => setLoading(false));
  }, [bloodGroup]);

  const stockStatus = useMemo(() => {
    if (results.length >= 3) {
      return { label: "Available", className: "urgency-safe" };
    }
    if (results.length >= 1) {
      return { label: "Low", className: "urgency-moderate" };
    }
    return { label: "Critical", className: "urgency-critical" };
  }, [results.length]);

  return (
    <>
      <section className="panel-shell">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Resource Monitor</p>
            <h3 className="text-lg font-semibold text-slate-100">Blood Availability</h3>
          </div>
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${stockStatus.className}`}>
            {stockStatus.label}
          </span>
        </div>

        <p className="text-sm text-slate-300">
          Matching sources for <span className="font-semibold text-slate-100">{bloodGroup}</span>: {results.length}
        </p>

        {loading ? (
          <div className="mt-3 h-12 rounded-lg shimmer-block" />
        ) : (
          <div className="mt-3 space-y-1 text-sm text-slate-300">
            {results.slice(0, 2).map((item) => (
              <p key={item.id}>• {item.name} ({item.distanceKm} km)</p>
            ))}
            {!results.length ? <p>• No active nearby match</p> : null}
          </div>
        )}
      </section>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
          >
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="modal-shell"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Blood Request Flow</p>
                  <h3 className="text-lg font-semibold text-slate-100">Need Blood</h3>
                </div>
                <button type="button" onClick={onClose} className="quick-pill">
                  Close
                </button>
              </div>

              <div className="mb-4 flex items-center gap-3">
                <label className="text-sm text-slate-300">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(event) => setBloodGroup(event.target.value)}
                  className="rounded-lg border border-white/20 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
                >
                  {bloodGroups.map((group) => (
                    <option key={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-5">
                <div className="md:col-span-3 overflow-hidden rounded-xl border border-white/10">
                  <iframe
                    title="Blood map"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(`${bloodGroup} blood bank near me`)}&z=12&output=embed`}
                    className="h-72 w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  {loading ? (
                    <>
                      <div className="h-16 rounded-lg shimmer-block" />
                      <div className="h-16 rounded-lg shimmer-block" />
                    </>
                  ) : (
                    results.slice(0, 5).map((item) => (
                      <div key={item.id} className="rounded-lg border border-white/10 bg-slate-900/40 p-3">
                        <p className="text-sm font-semibold text-slate-100">{item.name}</p>
                        <p className="text-xs text-slate-300">{item.type} • {item.distanceKm} km</p>
                        <p className="mt-1 text-xs text-slate-300">{item.phone}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
