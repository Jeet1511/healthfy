import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, PhoneCall, Shield, Activity } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useRef } from "react";

export function Hero() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <section ref={containerRef} className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Premium Multi-layered ECG Background */}
      <motion.div style={{ opacity, y: y1 }} className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <svg
          viewBox="0 0 1000 200"
          className="w-full h-full text-blue-500 absolute top-1/2 -translate-y-1/2 opacity-10 blur-[2px]"
          preserveAspectRatio="none"
        >
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            d="M0,100 L300,100 L330,20 L360,180 L390,100 L1000,100"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <svg
          viewBox="0 0 1000 200"
          className="w-full h-full text-blue-600 absolute top-1/2 -translate-y-1/2 opacity-20"
          preserveAspectRatio="none"
        >
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
            d="M0,100 L300,100 L330,20 L360,180 L390,100 L1000,100"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Floating Orbs for Depth */}
      <motion.div style={{ y: y2 }} className="absolute top-20 right-20 w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-[120px] -z-10 mix-blend-multiply pointer-events-none" />
      <motion.div style={{ y: y1 }} className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-teal-200/40 rounded-full blur-[100px] -z-10 mix-blend-multiply pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-2xl relative z-20"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-blue-100/50 shadow-sm text-blue-700 text-sm font-semibold mb-8"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-[pulse_2s_infinite]"></span>
              Smart Emergency Assistant
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.05] mb-8">
              When seconds matter, <br />
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 pb-2">
                LifeLine responds.
                <motion.div 
                  initial={{ scaleX: 0 }} 
                  animate={{ scaleX: 1 }} 
                  transition={{ delay: 1, duration: 1 }}
                  className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600/30 to-teal-500/30 rounded-full origin-left blur-[2px]"
                />
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-slate-600 mb-10 leading-relaxed max-w-xl font-light">
              AI-powered triage that instantly understands your medical situation,
              guides your actions, and connects you to nearby responders.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 mb-12">
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex justify-center items-center gap-3 px-8 py-4 bg-gradient-to-b from-red-500 to-red-600 text-white font-semibold rounded-2xl shadow-[0_15px_30px_-10px_rgba(239,68,68,0.5)] border border-red-400 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <motion.div
                  animate={{ rotate: [-5, 5, -5] }}
                  transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <PhoneCall className="w-5 h-5 relative z-10" />
                </motion.div>
                <span className="relative z-10">Get Help Now</span>
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05, y: -2, backgroundColor: "rgba(255,255,255,1)" }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex justify-center items-center gap-3 px-8 py-4 bg-white/70 backdrop-blur-md border border-slate-200/50 text-slate-700 font-semibold rounded-2xl shadow-[0_8px_20px_-8px_rgba(0,0,0,0.1)] transition-colors"
              >
                Explore Platform
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </motion.button>
            </div>

            <div className="flex items-center gap-8 text-sm font-semibold text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-teal-600" />
                </div>
                Secure & Private
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-blue-600" />
                </div>
                24/7 Monitored
              </div>
            </div>
          </motion.div>

          {/* Right Image with 3D Parallax Depth */}
          <motion.div
            style={{ y: useTransform(scrollYProgress, [0, 1], [0, 100]) }}
            initial={{ opacity: 0, x: 50, rotateY: 15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            className="relative perspective-[1000px] z-10"
          >
            <motion.div 
              whileHover={{ rotateY: -5, rotateX: 5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(30,58,138,0.2)] border-[10px] border-white/60 backdrop-blur-xl transform-gpu"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent z-10 pointer-events-none mix-blend-overlay" />
              
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1676552055618-22ec8cde399a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBoZWFsdGhjYXJlJTIwZG9jdG9yJTIwaWxsdXN0cmF0aW9ufGVufDF8fHx8MTc3NDYwMDA4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Modern Healthcare"
                className="w-full h-auto object-cover aspect-[4/3] sm:aspect-[4/3] lg:aspect-[4/5] scale-[1.01]"
              />
              
              {/* Floating UI Card inside Hero */}
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                className="absolute bottom-6 left-6 right-6 z-20 bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border border-white/50"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center shrink-0">
                      <Activity className="w-7 h-7" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-ping" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-bold text-slate-900 flex justify-between">
                      System Active 
                      <span className="text-green-500 text-sm">Online</span>
                    </p>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">AI Triage ready for emergency</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
