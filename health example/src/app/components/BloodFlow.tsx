import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useState } from "react";

export function BloodFlow() {
  const { scrollYProgress } = useScroll();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const opacity = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);

  if (!mounted) return null;

  // viewBox: 1280 (width) x 100 (height as percentage mapping)
  const pathData = `
    M 640,0 
    C 800,5   900,10  750,15 
    C 500,22  300,25  550,35 
    C 800,45  900,55  640,60 
    C 400,65  300,75  500,85 
    C 600,92  640,95  640,100
  `;

  const nodes = [
    { x: "58.59%", y: "15%", delay: 0 },    // X: 750
    { x: "42.96%", y: "35%", delay: 0.5 },  // X: 550
    { x: "50%", y: "60%", delay: 1 },       // X: 640
    { x: "39.06%", y: "85%", delay: 1.5 },  // X: 500
  ];

  return (
    <motion.div 
      style={{ opacity }}
      className="absolute inset-0 max-w-7xl mx-auto w-full pointer-events-none z-0"
    >
      {/* Container for absolute positioning of SVG to handle stretch */}
      <div className="absolute top-0 left-0 w-full h-full opacity-60 mix-blend-multiply">
        <svg
          viewBox="0 0 1280 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="line-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
              <stop offset="20%" stopColor="#ef4444" stopOpacity="0.3" />
              <stop offset="80%" stopColor="#ef4444" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="active-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
              <stop offset="50%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="pulse-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="50%" stopColor="#ffb3b3" stopOpacity="1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Very faint background track */}
          <path
            d={pathData}
            fill="none"
            stroke="url(#line-gradient)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            className="opacity-40"
          />

          {/* 2. Scrolling active line */}
          <motion.path
            d={pathData}
            fill="none"
            stroke="url(#active-gradient)"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
            filter="url(#glow)"
            style={{ pathLength: scrollYProgress }}
          />

          {/* 3. Fast small pulse traveling down */}
          <motion.path
            d={pathData}
            fill="none"
            stroke="url(#pulse-gradient)"
            strokeWidth="4"
            vectorEffect="non-scaling-stroke"
            filter="url(#glow)"
            pathLength="1"
            strokeDasharray="0.015 1"
            animate={{ strokeDashoffset: [1, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="opacity-70"
          />

          {/* 4. Second slightly slower/larger pulse for depth */}
          <motion.path
            d={pathData}
            fill="none"
            stroke="url(#active-gradient)"
            strokeWidth="6"
            vectorEffect="non-scaling-stroke"
            filter="url(#soft-glow)"
            pathLength="1"
            strokeDasharray="0.05 1"
            animate={{ strokeDashoffset: [1, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear", delay: 2 }}
            className="opacity-40"
          />
        </svg>
      </div>

      {/* HTML absolute nodes to prevent stretching */}
      {nodes.map((node, i) => (
        <div 
          key={i} 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{ left: node.x, top: node.y }}
        >
          {/* Outer expanding glow ring */}
          <motion.div
            className="absolute w-8 h-8 rounded-full border border-red-500/50"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 2, 0.5], opacity: [0, 0.6, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: node.delay, ease: "easeInOut" }}
          />
          
          {/* Inner pulsing body */}
          <motion.div
            className="relative w-3 h-3 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.8)]"
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, delay: node.delay, ease: "easeInOut" }}
          >
            {/* Core bright dot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full blur-[0.5px]" />
          </motion.div>
        </div>
      ))}
    </motion.div>
  );
}
