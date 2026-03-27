"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export function ScrollBloodDrop() {
  const { scrollYProgress } = useScroll();
  const smoothY = useSpring(scrollYProgress, { stiffness: 60, damping: 20, restDelta: 0.001 });

  const top1 = useTransform(smoothY, [0, 0.9], ["0%", "100%"]);
  const top2 = useTransform(smoothY, [0, 0.9], ["-10%", "90%"]);
  const top3 = useTransform(smoothY, [0, 0.9], ["-20%", "80%"]);
  const opacity = useTransform(smoothY, [0, 0.8, 0.95], [1, 1, 0]);
  const rippleScale = useTransform(smoothY, [0.85, 0.9, 0.95], [0.5, 1.5, 2.5]);
  const rippleOpacity = useTransform(smoothY, [0.85, 0.9, 0.95], [0, 1, 0]);

  return (
    <div className="pointer-events-none fixed bottom-20 left-4 top-32 z-50 hidden w-8 overflow-visible lg:block md:left-8">
      <div className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-linear-to-b from-red-500/0 via-red-500/10 to-red-500/0" />

      <motion.div style={{ top: top1, opacity }} className="absolute left-1/2 flex w-4 -translate-x-1/2 flex-col items-center justify-end">
        <div className="h-3 w-1.5 rounded-b-full rounded-t-full bg-linear-to-b from-red-400 to-red-600 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
        <div className="absolute inset-0 -z-10 rounded-full bg-red-500/40 blur-xs" />
      </motion.div>

      <motion.div style={{ top: top2, opacity }} className="absolute left-1/2 flex w-4 -translate-x-1/2 flex-col items-center justify-end">
        <div className="h-2 w-1 rounded-b-full rounded-t-full bg-linear-to-b from-red-300 to-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
      </motion.div>

      <motion.div style={{ top: top3, opacity }} className="absolute left-1/2 flex w-4 -translate-x-1/2 flex-col items-center justify-end">
        <div className="h-2 w-1 rounded-b-full rounded-t-full bg-linear-to-b from-red-300 to-red-500 shadow-[0_0_6px_rgba(239,68,68,0.4)]" />
      </motion.div>

      <div className="absolute left-1/2 top-[95%] flex h-8 w-8 -translate-x-1/2 items-center justify-center">
        <motion.div style={{ scale: rippleScale, opacity: rippleOpacity }} className="absolute h-full w-full rounded-full border-2 border-red-500" />
        <motion.div style={{ scale: rippleScale, opacity: rippleOpacity }} className="absolute h-full w-full scale-75 rounded-full border border-red-400" />
      </div>
    </div>
  );
}
