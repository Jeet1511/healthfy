"use client";

import { motion } from "framer-motion";
import { Star, Clock, ArrowRight, Stethoscope } from "lucide-react";
import { ImageWithFallback } from "@/frontend/components/figma/ImageWithFallback";

const featuredDoctors = [
  {
    id: 1,
    name: "Dr. Sarah Jenkins",
    specialty: "Emergency Medicine",
    rating: 4.9,
    reviews: 128,
    availability: "Available Now",
    image:
      "https://images.unsplash.com/photo-1772987057599-2f1088c1e993?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBmZW1hbGUlMjBkb2N0b3IlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzQ1MDMwMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Cardiology Specialist",
    rating: 4.8,
    reviews: 94,
    availability: "In 15 mins",
    image:
      "https://images.unsplash.com/photo-1615177393114-bd2917a4f74a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYWxlJTIwZG9jdG9yJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzc0NTEwNzM4fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: 3,
    name: "Dr. Emily Rostova",
    specialty: "Neurology",
    rating: 5.0,
    reviews: 210,
    availability: "Tomorrow, 9 AM",
    image:
      "https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGF2YXRhcnxlbnwxfHx8fDE3NzQ1NzQzOTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

export function DoctorSection() {
  return (
    <section className="relative z-10 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-end justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Find Verified Doctors</h2>
            <p className="mt-3 text-lg font-medium text-slate-500">Top-rated specialists available for consultation</p>
          </motion.div>
          <motion.button
            whileHover={{ x: 5 }}
            className="hidden items-center gap-2 rounded-xl border border-white/80 bg-white/50 px-4 py-2 font-bold text-blue-600 transition-colors hover:text-blue-700 sm:flex"
          >
            See all doctors <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuredDoctors.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <Stethoscope className="pointer-events-none absolute -right-[10px] -top-[10px] h-32 w-32 rotate-12 text-blue-500/0 transition-colors duration-700 group-hover:text-blue-500/5" />

              <div className="relative z-10 flex gap-5">
                <div className="relative shrink-0">
                  <ImageWithFallback src={doc.image} alt={doc.name} className="h-24 w-24 rounded-2xl border-2 border-white object-cover shadow-md" />
                  {doc.availability.includes("Now") ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-[3px] border-white bg-green-500 shadow-sm"
                    />
                  ) : null}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-xl font-bold leading-tight text-slate-900 transition-colors group-hover:text-blue-600">{doc.name}</h3>
                  <p className="mb-3 text-sm font-semibold text-slate-500">{doc.specialty}</p>
                  <div className="flex w-fit items-center gap-1.5 rounded-lg bg-slate-50/80 px-2 py-1 text-sm">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-700">{doc.rating}</span>
                    <span className="text-slate-400">({doc.reviews})</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-6 flex items-center justify-between border-t border-slate-200/60 pt-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <Clock className="h-4 w-4 text-blue-500" />
                  {doc.availability}
                </div>
                <button className="rounded-xl bg-blue-50/80 px-5 py-2.5 text-sm font-bold text-blue-600 shadow-sm transition-all hover:bg-blue-600 hover:text-white">
                  Book Visit
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
