import { motion, AnimatePresence } from "motion/react";
import { Search, Stethoscope, Building2, Droplet, AlertTriangle, Pill, Map as MapIcon, Activity, HeartPulse } from "lucide-react";
import { useState, useEffect } from "react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

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
    "Emergency resources..."
  ];
  
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative pt-28 pb-10 lg:pt-40 lg:pb-16 flex flex-col items-center justify-center text-center perspective-1000">
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          {/* Subtle Online Indicator */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/80 shadow-[0_8px_16px_rgb(0,0,0,0.04)] text-slate-700 text-sm font-semibold mb-8"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            Live Global Health Network
          </motion.div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-[1.1]">
            Your human healthcare <br />
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 pb-2">
              discovery platform.
              <motion.div 
                initial={{ scaleX: 0 }} 
                animate={{ scaleX: 1 }} 
                transition={{ delay: 0.5, duration: 1 }}
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600/30 to-teal-500/30 rounded-full origin-left blur-[2px]"
              />
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Search for trusted doctors, nearby hospitals, emergency resources, and critical supplies all in one place.
          </p>

          {/* Central Search Bar with Glassmorphism and Glow */}
          <div className="relative w-full max-w-3xl mx-auto mb-16 z-20">
            {/* Outer Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-teal-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-500" />
            
            <motion.div 
              className="relative bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white/60 flex items-center p-2 focus-within:ring-4 focus-within:ring-blue-500/20 focus-within:bg-white transition-all duration-300 overflow-hidden"
              whileHover={{ scale: 1.01, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className="pl-5 pr-3 text-blue-500">
                <Search className="w-6 h-6" />
              </div>
              
              <div className="relative flex-1 h-14 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPlaceholder}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex items-center pointer-events-none text-slate-400 text-lg font-medium pl-1"
                  >
                    {placeholders[currentPlaceholder]}
                  </motion.div>
                </AnimatePresence>
                <input 
                  type="text" 
                  className="w-full h-full bg-transparent border-none outline-none text-slate-800 text-lg font-medium relative z-10 placeholder:text-transparent"
                />
              </div>

              <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 z-10 relative overflow-hidden group">
                <span className="relative z-10">Search</span>
                <motion.div 
                  className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                />
              </button>
            </motion.div>
          </div>

          {/* Floating Category Chips */}
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto z-20 relative">
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
                  className="flex items-center gap-2.5 px-6 py-3.5 bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl shadow-[0_8px_16px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.1)] hover:bg-white/90 transition-all group overflow-hidden relative"
                >
                  <div className={`p-2 rounded-xl ${cat.bg} border ${cat.border} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-4 h-4 ${cat.color}`} />
                  </div>
                  <span className="font-bold text-slate-700 text-sm">{cat.name}</span>
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-r ${cat.color.replace('text', 'from')}-500 to-transparent`} />
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* 3D Dashboard Preview Centerpiece */}
      <motion.div 
        initial={{ opacity: 0, y: 100, rotateX: 20 }}
        animate={{ opacity: 1, y: 0, rotateX: 10, rotateY: -2 }}
        transition={{ delay: 0.6, duration: 1.2, type: "spring", stiffness: 50 }}
        whileHover={{ rotateX: 5, rotateY: 0, y: -10 }}
        className="w-full max-w-5xl mx-auto mt-12 relative z-10 transform-gpu perspective-[1200px]"
      >
        <div className="absolute -inset-4 bg-gradient-to-b from-blue-500/10 to-transparent blur-2xl rounded-[3rem]" />
        
        <div className="relative rounded-[2.5rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] overflow-hidden p-2">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-white/10 rounded-[2rem] pointer-events-none" />
          
          <div className="relative rounded-[2rem] overflow-hidden bg-slate-50/50 border border-white/50 aspect-[21/9] flex items-center justify-center">
            {/* Mock Map / Dashboard */}
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1511526088318-f1a6d7646a05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMGxpZ2h0JTIwbWFwJTIwVUl8ZW58MXx8fHwxNzc0NjA1MTUyfDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Live Dashboard Map"
              className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-luminosity"
            />
            
            {/* Animated Nodes and Connections Overlay */}
            <div className="absolute inset-0 bg-blue-900/5 mix-blend-overlay" />
            
            {/* Connection Lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 400" preserveAspectRatio="none">
              <motion.path 
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.4 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                d="M 200 200 Q 350 100 500 250 T 800 150" 
                fill="none" stroke="url(#lineGrad)" strokeWidth="3" strokeDasharray="5,5" 
              />
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                  <stop offset="50%" stopColor="#14b8a6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Floating Markers */}
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
                  <div className={`relative w-12 h-12 rounded-2xl ${node.color} text-white flex items-center justify-center shadow-lg border-2 border-white backdrop-blur-md`}>
                    <Icon className="w-6 h-6" />
                    <span className="absolute -inset-2 rounded-2xl bg-white/20 blur-md animate-pulse" />
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
