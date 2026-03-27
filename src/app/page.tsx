"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const features = [
  {
    icon: "⚕",
    title: "Emergency AI",
    description: "Instant urgency detection with clear actions when every second matters.",
  },
  {
    icon: "🩸",
    title: "Blood Finder",
    description: "Find nearest blood sources with availability indicators and map guidance.",
  },
  {
    icon: "🚨",
    title: "Crisis Mode",
    description: "High-contrast emergency protocol with step-by-step response flows.",
  },
  {
    icon: "🗺",
    title: "Smart Map",
    description: "Live geo-intelligence for hospitals, clinics, pharmacies, and response routes.",
  },
];

const scenarios = [
  {
    title: "Chest pain at home",
    text: "AI detects high risk and suggests immediate ambulance escalation.",
  },
  {
    title: "Urgent blood request",
    text: "Nearest matching blood sources appear instantly with availability status.",
  },
  {
    title: "Road accident alert",
    text: "Crisis mode launches a rapid protocol with one-tap emergency contacts.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-command text-slate-100">
      <div className="floating-light left-[-120px] top-16 h-72 w-72" />
      <div className="floating-light floating-light-alt right-[-140px] top-72 h-80 w-80" />

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="panel-shell relative overflow-hidden"
        >
          <div className="section-divider" />
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">LifeLine Platform</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
            When seconds matter, LifeLine responds.
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            A smart emergency and healthcare platform that combines AI triage, blood intelligence, and crisis response into one trusted system.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/auth" className="primary-btn">Get Started</Link>
            <Link href="/platform" className="quick-pill px-4 py-2 text-sm">Try Live Demo</Link>
          </div>
        </motion.section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="panel-shell feature-card"
            >
              <p className="text-2xl">{feature.icon}</p>
              <h2 className="text-lg font-semibold text-slate-100">{feature.title}</h2>
              <p className="mt-2 text-sm text-slate-300">{feature.description}</p>
            </motion.article>
          ))}
        </section>

        <section className="mt-6 panel-shell">
          <div className="section-divider" />
          <h2 className="text-2xl font-semibold text-slate-100">How it works</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-slate-900/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Step 1</p>
              <p className="mt-1 text-sm">Describe your emergency scenario in plain language.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Step 2</p>
              <p className="mt-1 text-sm">LifeLine AI classifies urgency and suggests immediate actions.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/35 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Step 3</p>
              <p className="mt-1 text-sm">Connect to nearby resources: hospitals, blood banks, and crisis contacts.</p>
            </div>
          </div>
        </section>

        <section className="mt-6 panel-shell">
          <div className="section-divider" />
          <h2 className="text-2xl font-semibold text-slate-100">Real-life scenarios</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {scenarios.map((item) => (
              <article key={item.title} className="rounded-xl border border-white/10 bg-slate-900/35 p-4">
                <h3 className="font-medium text-slate-100">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="mt-8 border-t border-white/10 pt-4 text-sm text-slate-400">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p>LifeLine © 2026 · Smart Emergency & Healthcare Platform</p>
            <div className="flex gap-3">
              <Link href="/platform" className="hover:text-slate-200">Platform</Link>
              <Link href="/platform/profile" className="hover:text-slate-200">Profile</Link>
              <a href="mailto:care@lifeline.health" className="hover:text-slate-200">Contact</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
