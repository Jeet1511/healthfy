"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Stethoscope,
  Building2,
  Droplet,
  AlertTriangle,
  Pill,
  Map as MapIcon,
  Activity,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ImageWithFallback } from "@/frontend/components/figma/ImageWithFallback";

export function PlatformHero() {
  const categories = [
    { name: "Doctors", icon: Stethoscope, color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200" },
    { name: "Hospitals", icon: Building2, color: "text-teal-600", bg: "bg-teal-100", border: "border-teal-200" },
    { name: "Blood & Organs", icon: Droplet, color: "text-red-500", bg: "bg-red-100", border: "border-red-200" },
    { name: "Emergency", icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-100", border: "border-orange-200" },
    { name: "Medicines", icon: Pill, color: "text-purple-500", bg: "bg-purple-100", border: "border-purple-200" },
    { name: "Map", icon: MapIcon, color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-200" },
  ];

  const placeholders = [
    "Search doctors near you...",
    "Find nearby hospitals...",
    "Search blood type O-...",
    "Emergency resources...",
  ];

  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [placeholders.length]);

  return (
    <section className="relative flex flex-col items-center justify-center pb-16 pt-28 text-center lg:pb-16 lg:pt-40">
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_8px_16px_rgb(0,0,0,0.04)] backdrop-blur-md"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
            </span>
            Live Global Health Network
          </motion.div>

          <h1 className="mb-6 text-5xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
            Your human healthcare <br />
            <span className="relative inline-block bg-linear-to-r from-blue-600 via-teal-500 to-emerald-500 bg-clip-text pb-2 text-transparent">
              discovery platform.
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="absolute bottom-0 left-0 right-0 h-1 origin-left rounded-full bg-linear-to-r from-blue-600/30 to-teal-500/30 blur-[2px]"
              />
            </span>
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-xl font-medium leading-relaxed text-slate-600">
            Search for trusted doctors, nearby hospitals, emergency resources, and critical supplies all in one place.
          </p>

          <div className="relative z-20 mx-auto mb-16 w-full max-w-3xl">
            <div className="absolute -inset-1 rounded-3xl bg-linear-to-r from-blue-500 to-teal-500 opacity-20 blur-xl transition duration-500" />
            <motion.div
              className="relative flex items-center overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-2 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] backdrop-blur-2xl transition-all duration-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/20"
              whileHover={{ scale: 1.01, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className="pl-5 pr-3 text-blue-500">
                <Search className="h-6 w-6" />
              </div>

              <div className="relative h-14 flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPlaceholder}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="pointer-events-none absolute inset-0 flex items-center pl-1 text-lg font-medium text-slate-400"
                  >
                    {placeholders[currentPlaceholder]}
                  </motion.div>
                </AnimatePresence>
                <input className="relative z-10 h-full w-full border-none bg-transparent text-lg font-medium text-slate-800 outline-none placeholder:text-transparent" />
              </div>

              <button className="group relative z-10 overflow-hidden rounded-2xl bg-linear-to-r from-blue-600 to-blue-700 px-8 py-3.5 font-bold text-white shadow-md transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg">
                <span className="relative z-10">Search</span>
                <motion.div className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
              </button>
            </motion.div>
          </div>

          <div className="relative z-20 mx-auto flex max-w-4xl flex-wrap justify-center gap-4">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.button
                  key={cat.name}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i + 0.3, type: "spring" }}
                  whileHover={{ y: -5, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative overflow-hidden rounded-2xl border border-white/80 bg-white/60 px-6 py-3.5 shadow-[0_8px_16px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all hover:bg-white/90 hover:shadow-[0_20px_40px_rgb(0,0,0,0.1)]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`rounded-xl border p-2 ${cat.bg} ${cat.border} transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className={`h-4 w-4 ${cat.color}`} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 100, rotateX: 20 }}
        animate={{ opacity: 1, y: 0, rotateX: 10, rotateY: -2 }}
        transition={{ delay: 0.6, duration: 1.2, type: "spring", stiffness: 50 }}
        whileHover={{ rotateX: 5, rotateY: 0, y: -10 }}
        className="relative z-10 mx-auto mt-12 w-full max-w-5xl transform-gpu"
      >
        <div className="absolute -inset-4 rounded-[3rem] bg-linear-to-b from-blue-500/10 to-transparent blur-2xl" />

        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/40 p-2 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0 rounded-4xl bg-linear-to-tr from-white/40 to-white/10" />

          <div className="relative aspect-21/9 overflow-hidden rounded-4xl border border-white/50 bg-slate-50/50">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1511526088318-f1a6d7646a05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMGxpZ2h0JTIwbWFwJTIwVUl8ZW58MXx8fHwxNzc0NjA1MTUyfDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Live Dashboard Map"
              className="absolute inset-0 h-full w-full object-cover opacity-50 mix-blend-luminosity"
            />

            <div className="absolute inset-0 bg-blue-900/5 mix-blend-overlay" />

            {[
              { top: "30%", left: "20%", color: "bg-blue-500", icon: Stethoscope },
              { top: "60%", left: "50%", color: "bg-teal-500", icon: Building2 },
              { top: "40%", left: "80%", color: "bg-red-500", icon: Activity },
            ].map((node, i) => {
              const Icon = node.icon;
              return (
                <motion.div
                  key={i}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, delay: i, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute flex flex-col items-center gap-2"
                  style={{ top: node.top, left: node.left }}
                >
                  <div className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white text-white shadow-lg backdrop-blur-md ${node.color}`}>
                    <Icon className="h-6 w-6" />
                    <span className="absolute -inset-2 rounded-2xl bg-white/20 blur-md" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
