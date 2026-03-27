import { motion } from "motion/react";
import { Activity, MapPin, AlertCircle } from "lucide-react";

export function TopStatus() {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] border border-white p-4">
      {/* System Status */}
      <div className="flex items-center gap-4 px-4 py-2 bg-blue-50/50 rounded-2xl border border-blue-100/50 w-full md:w-auto">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-400 rounded-full blur-[8px] animate-pulse opacity-50" />
          <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center relative z-10 border border-blue-50">
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            System Monitoring Active
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">All emergency protocols ready</p>
        </div>
      </div>

      {/* Subtle ECG line in middle */}
      <div className="hidden md:block flex-1 max-w-[200px] h-10 relative opacity-40">
        <svg viewBox="0 0 100 20" className="w-full h-full text-blue-500" preserveAspectRatio="none">
          <motion.path
            d="M0,10 L30,10 L35,2 L45,18 L50,10 L100,10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </svg>
      </div>

      {/* Location / Urgent Toggle */}
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 rounded-2xl flex-1 md:flex-none">
          <MapPin className="w-4 h-4 text-slate-400" />
          <div className="text-sm font-medium text-slate-700">
            Current: <span className="font-bold text-slate-900">San Francisco, CA</span>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-100 transition-colors border border-red-100"
        >
          <AlertCircle className="w-4 h-4" />
          Crisis Mode
        </motion.button>
      </div>
    </div>
  );
}
