"use client";

import { motion } from "framer-motion";
import { Bot, ArrowRight, Sparkles, Activity, MessageSquare } from "lucide-react";
import Link from "next/link";

export function AiAssistantSection() {
  return (
    <section className="relative z-10 overflow-hidden py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex flex-col items-center gap-12 rounded-[3rem] bg-linear-to-br from-indigo-900 via-blue-900 to-slate-900 p-8 shadow-[0_30px_60px_-15px_rgba(30,58,138,0.5)] sm:p-12 lg:flex-row lg:gap-20 lg:p-16">
          <div className="absolute inset-0 overflow-hidden rounded-[3rem]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              className="absolute -right-[20%] -top-[50%] h-[150%] w-[120%] bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[30px_30px] opacity-40 mix-blend-overlay"
            />
            <div className="absolute bottom-0 right-0 h-125 w-125 rounded-full bg-blue-500/20 blur-[100px]" />
          </div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative z-10 lg:w-1/2"
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-blue-200 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-blue-400" />
              LifeLine AI Assistant
            </div>

            <h2 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              Instant medical guidance at your fingertips.
            </h2>

            <p className="mb-10 max-w-lg text-xl font-medium leading-relaxed text-blue-100/80">
              Not sure if it&apos;s an emergency? Describe your symptoms and our AI will triage your condition, suggest immediate actions, and connect you to the right specialist.
            </p>

            <Link href="/platform/emergency-ai">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 font-bold text-blue-900 shadow-[0_10px_30px_rgba(255,255,255,0.2)] transition-all hover:shadow-[0_15px_40px_rgba(255,255,255,0.3)]"
              >
                Start Free Consultation <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </Link>

            <div className="mt-10 flex items-center gap-6 text-sm font-semibold text-blue-200">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-400" /> Responses in &lt;3s
              </div>
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-400" /> Clinically Trained
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, rotateY: 10 }}
            whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5, rotateY: -5 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="relative z-10 w-full max-w-md transform-gpu lg:w-1/2"
          >
            <div className="overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl">
              <div className="mb-6 flex items-center gap-4 border-b border-white/10 pb-4">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 shadow-inner">
                  <Bot className="h-6 w-6 text-white" />
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-transparent bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold leading-none text-white">LifeLine Assistant</h3>
                  <p className="text-sm font-medium text-blue-200">Online & Ready</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-blue-600 px-5 py-3 text-white shadow-md">
                    <p className="text-sm font-medium">My father is experiencing sudden chest tightness and shortness of breath.</p>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="flex justify-start"
                >
                  <div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-white/50 bg-white/90 px-5 py-4 text-slate-800 shadow-lg backdrop-blur-md">
                    <div className="mb-2 flex w-fit items-center gap-2 rounded-lg bg-red-50 px-2 py-1 text-sm font-bold text-red-600">
                      <Activity className="h-4 w-4" /> High Priority
                    </div>
                    <p className="mb-3 text-sm font-medium">This could be a cardiac event. Please do the following immediately:</p>
                    <ul className="mb-3 space-y-2 text-sm font-semibold text-slate-600">
                      <li className="flex gap-2"><span className="text-blue-500">1.</span> Have him sit down and rest.</li>
                      <li className="flex gap-2"><span className="text-blue-500">2.</span> Call local emergency or tap below to dispatch nearest ambulance.</li>
                    </ul>
                    <button className="w-full rounded-xl bg-red-500 py-2 text-sm font-bold text-white shadow-md transition-colors hover:bg-red-600">
                      Dispatch Ambulance
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-6 -top-6 rounded-2xl border border-white/50 bg-white p-4 shadow-xl backdrop-blur-md"
            >
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
