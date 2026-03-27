"use client";

import { motion } from "framer-motion";

type StatusBarProps = {
  aiActive: boolean;
  locationSynced: boolean;
};

export function StatusBar({ aiActive, locationSynced }: StatusBarProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="status-shell"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-slate-300/80">
            LifeLine Command Interface
          </p>
          <h1 className="mt-1 text-xl font-semibold text-slate-100 md:text-2xl">
            Smart Emergency & Healthcare Platform
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className={`status-chip ${aiActive ? "status-chip-live" : "status-chip-idle"}`}>
            AI Active
          </span>
          <span className={`status-chip ${locationSynced ? "status-chip-live" : "status-chip-idle"}`}>
            Location Synced
          </span>
        </div>
      </div>
    </motion.header>
  );
}
