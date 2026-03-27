"use client";

import { motion } from "framer-motion";
import { Droplet, Heart, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";

export function ResourceNetwork() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute right-0 top-1/2 h-200 w-200 -translate-y-1/2 rounded-full bg-red-400/10 blur-[120px] mix-blend-multiply" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-16 rounded-[3rem] border border-white/80 bg-white/40 p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] backdrop-blur-3xl sm:p-16 lg:flex-row">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-red-100/50 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
              </span>
              Live Network
            </div>

            <h2 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Blood & Organ <br />
              <span className="bg-linear-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Resource Network</span>
            </h2>

            <p className="mb-10 max-w-lg text-xl font-medium leading-relaxed text-slate-600">
              Check real-time availability of critical blood types and organ donations across nearby hospitals and registered donors.
            </p>

            <Link href="/platform/blood-finder">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-slate-900 to-slate-800 px-8 py-4 font-bold text-white shadow-xl transition-all hover:shadow-2xl"
              >
                Access Network <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </Link>
          </motion.div>

          <div className="relative grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 30, rotateY: -10 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02, rotateY: 5 }}
              className="rounded-3xl border border-white bg-white/80 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)] backdrop-blur-xl"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-200 bg-linear-to-br from-red-50 to-red-100 shadow-inner">
                <Droplet className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">Blood Banks</h3>
              <p className="mb-6 text-sm font-semibold text-slate-500">4 nearby facilities updated recently</p>
              <div className="flex w-fit items-center gap-2 rounded-xl border border-red-100 bg-red-50/80 px-4 py-2 text-sm font-bold text-red-600">
                <Activity className="h-4 w-4 animate-pulse" /> High Demand: O-
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30, rotateY: 10 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -5, scale: 1.02, rotateY: -5 }}
              className="mt-0 rounded-3xl border border-white bg-white/80 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:mt-12"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-200 bg-linear-to-br from-blue-50 to-blue-100 shadow-inner">
                <Heart className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">Active Donors</h3>
              <p className="mb-6 text-sm font-semibold text-slate-500">128 registered donors in your area</p>
              <div className="flex w-fit items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/80 px-4 py-2 text-sm font-bold text-blue-600">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                Online Now
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
