"use client";

import { motion } from "framer-motion";
import { MapPin, Navigation, ArrowRight, Activity } from "lucide-react";
import { ImageWithFallback } from "@/frontend/components/figma/ImageWithFallback";

const nearbyHospitals = [
  {
    id: 1,
    name: "General Hospital Center",
    type: "Public Hospital • ER Open",
    distance: "1.2 mi",
    time: "5 mins",
    status: "Normal Load",
    image:
      "https://images.unsplash.com/photo-1769147555720-71fc71bfc216?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3NwaXRhbCUyMGJ1aWxkaW5nJTIwZXh0ZXJpb3J8ZW58MXx8fHwxNzc0NTEzMDc2fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: 2,
    name: "City Medical Center",
    type: "Specialty Clinic",
    distance: "2.5 mi",
    time: "12 mins",
    status: "Busy",
    image:
      "https://images.unsplash.com/photo-1758101512269-660feabf64fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjbGluaWMlMjBkb2N0b3IlMjBpbnNpZGV8ZW58MXx8fHwxNzc0NjA2NzczfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

export function HospitalSection() {
  return (
    <section className="relative z-10 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-end justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Nearby Facilities</h2>
            <p className="mt-3 text-lg font-medium text-slate-500">Find the closest hospitals and urgent care centers</p>
          </motion.div>
          <motion.button
            whileHover={{ x: 5 }}
            className="hidden items-center gap-2 rounded-xl border border-white/80 bg-white/50 px-4 py-2 font-bold text-teal-600 transition-colors hover:text-teal-700 sm:flex"
          >
            View Map <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {nearbyHospitals.map((hospital, i) => (
            <motion.div
              key={hospital.id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="group flex cursor-pointer flex-col gap-6 rounded-4xl border border-white/80 bg-white/60 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] sm:flex-row"
            >
              <div className="relative h-48 shrink-0 overflow-hidden rounded-3xl shadow-inner sm:w-48">
                <ImageWithFallback src={hospital.image} alt={hospital.name} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-xl bg-white/90 px-3 py-1.5 text-xs font-extrabold text-slate-800 shadow-lg backdrop-blur-md">
                  <Navigation className="h-3.5 w-3.5 text-blue-500" /> {hospital.time}
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-center py-2">
                <h3 className="mb-2 text-2xl font-bold leading-tight text-slate-900 transition-colors group-hover:text-teal-600">{hospital.name}</h3>
                <p className="mb-6 w-fit rounded-lg bg-slate-50/80 px-3 py-1 text-sm font-semibold text-slate-500">{hospital.type}</p>

                <div className="mt-auto flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 rounded-xl border border-slate-100 bg-white/80 px-3 py-2 text-sm font-bold text-slate-700 shadow-sm">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {hospital.distance}
                  </div>
                  <div className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold shadow-sm ${hospital.status === "Busy" ? "border border-orange-100 bg-orange-50 text-orange-600" : "border border-teal-100 bg-teal-50 text-teal-600"}`}>
                    {hospital.status === "Busy" ? (
                      <Activity className="h-4 w-4 animate-pulse" />
                    ) : (
                      <div className="h-2.5 w-2.5 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
                    )}
                    {hospital.status}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
