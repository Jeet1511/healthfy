"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const activity = [
  "09:42 · Emergency AI classified chest pain as Critical",
  "09:39 · Blood request O+ matched with 3 nearby sources",
  "09:32 · Crisis protocol initiated for road accident",
];

export default function PlatformDashboardPage() {
  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <section className="panel-shell lg:col-span-3">
        <h3 className="text-xl font-semibold text-slate-100">Quick Actions</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Link href="/platform/emergency-ai" className="quick-tile">⚕ Report Emergency</Link>
          <Link href="/platform/blood-finder" className="quick-tile">🩸 Find Blood</Link>
          <Link href="/platform/map-locator" className="quick-tile">🗺 Locate Hospital</Link>
        </div>

        <div className="mt-5">
          <h4 className="text-sm font-semibold text-slate-200">Recent Activity</h4>
          <ul className="mt-2 space-y-2 text-sm text-slate-300">
            {activity.map((item, index) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="rounded-lg border border-white/10 bg-slate-900/35 p-3"
              >
                {item}
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <section className="panel-shell lg:col-span-2">
        <h3 className="text-xl font-semibold text-slate-100">System Status</h3>
        <div className="mt-4 space-y-3 text-sm">
          <div className="rounded-xl border border-white/10 bg-slate-900/35 p-3">
            <p className="text-slate-400">AI Triage Engine</p>
            <p className="mt-1 text-emerald-300">Operational · Avg response 4.3s</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900/35 p-3">
            <p className="text-slate-400">Location Services</p>
            <p className="mt-1 text-sky-300">Synced · 16 resources indexed</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900/35 p-3">
            <p className="text-slate-400">Emergency Lines</p>
            <p className="mt-1 text-amber-300">Monitored · Ambulance/Police/Fire active</p>
          </div>
        </div>
      </section>
    </div>
  );
}
