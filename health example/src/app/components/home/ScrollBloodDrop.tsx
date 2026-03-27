import { motion, useScroll, useTransform, useSpring } from "motion/react";

export function ScrollBloodDrop() {
  const { scrollYProgress } = useScroll();
  const smoothY = useSpring(scrollYProgress, { stiffness: 60, damping: 20, restDelta: 0.001 });

  // Staggered top positions for 3 drops
  const top1 = useTransform(smoothY, [0, 0.9], ["0%", "100%"]);
  const top2 = useTransform(smoothY, [0, 0.9], ["-10%", "90%"]);
  const top3 = useTransform(smoothY, [0, 0.9], ["-20%", "80%"]);

  // Global fade out near bottom
  const opacity = useTransform(smoothY, [0, 0.8, 0.95], [1, 1, 0]);

  // Ripple effect at the landing spot
  const rippleScale = useTransform(smoothY, [0.85, 0.9, 0.95], [0.5, 1.5, 2.5]);
  const rippleOpacity = useTransform(smoothY, [0.85, 0.9, 0.95], [0, 1, 0]);

  return (
    <div className="fixed left-4 md:left-8 top-32 bottom-20 w-8 z-50 pointer-events-none hidden lg:block overflow-visible">
      {/* Subtle Track */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-red-500/0 via-red-500/10 to-red-500/0" />
      
      {/* Drop 1 */}
      <motion.div 
        style={{ top: top1, opacity }} 
        className="absolute left-1/2 -translate-x-1/2 w-4 flex flex-col items-center justify-end"
      >
        <div className="w-1.5 h-3 bg-gradient-to-b from-red-400 to-red-600 rounded-t-full rounded-b-full shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
        <div className="absolute inset-0 bg-red-500/40 blur-[4px] rounded-full -z-10" />
      </motion.div>

      {/* Drop 2 */}
      <motion.div 
        style={{ top: top2, opacity }} 
        className="absolute left-1/2 -translate-x-1/2 w-4 flex flex-col items-center justify-end"
      >
        <div className="w-1 h-2 bg-gradient-to-b from-red-300 to-red-500 rounded-t-full rounded-b-full shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
      </motion.div>

      {/* Drop 3 */}
      <motion.div 
        style={{ top: top3, opacity }} 
        className="absolute left-1/2 -translate-x-1/2 w-4 flex flex-col items-center justify-end"
      >
        <div className="w-1 h-2 bg-gradient-to-b from-red-300 to-red-500 rounded-t-full rounded-b-full shadow-[0_0_6px_rgba(239,68,68,0.4)]" />
      </motion.div>

      {/* Landing Ripple */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[95%] w-8 h-8 flex items-center justify-center">
        <motion.div 
          style={{ scale: rippleScale, opacity: rippleOpacity }}
          className="absolute w-full h-full border-2 border-red-500 rounded-full"
        />
        <motion.div 
          style={{ scale: rippleScale, opacity: rippleOpacity }}
          className="absolute w-full h-full border border-red-400 rounded-full scale-75"
        />
      </div>
    </div>
  );
}
