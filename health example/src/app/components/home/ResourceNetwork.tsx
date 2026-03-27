import { motion } from "motion/react";
import { Droplet, Heart, Activity, ArrowRight } from "lucide-react";
import { Link } from "react-router";

export function ResourceNetwork() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute top-1/2 -translate-y-1/2 right-0 w-[800px] h-[800px] bg-red-400/10 rounded-full blur-[120px] mix-blend-multiply pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center bg-white/40 backdrop-blur-3xl border border-white/80 rounded-[3rem] p-10 sm:p-16 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100/50 shadow-sm text-red-600 text-sm font-bold mb-8">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              Live Network
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
              Blood & Organ <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Resource Network</span>
            </h2>
            
            <p className="text-xl text-slate-600 mb-10 font-medium max-w-lg leading-relaxed">
              Check real-time availability of critical blood types and organ donations across nearby hospitals and registered donors.
            </p>

            <Link to="/blood-finder">
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all group"
              >
                Access Network <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>

          <div className="lg:w-1/2 w-full grid grid-cols-1 sm:grid-cols-2 gap-6 relative perspective-1000">
            <motion.div 
              initial={{ opacity: 0, y: 30, rotateY: -10 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02, rotateY: 5 }}
              className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-white transform-gpu"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <Droplet className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="font-bold text-slate-900 text-xl mb-2">Blood Banks</h3>
              <p className="text-sm text-slate-500 font-semibold mb-6">4 nearby facilities updated recently</p>
              <div className="flex items-center gap-2 text-sm font-bold text-red-600 bg-red-50/80 px-4 py-2 rounded-xl w-fit border border-red-100">
                <Activity className="w-4 h-4 animate-pulse" /> High Demand: O-
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30, rotateY: 10 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -5, scale: 1.02, rotateY: -5 }}
              className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-white mt-0 sm:mt-12 transform-gpu"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <Heart className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="font-bold text-slate-900 text-xl mb-2">Active Donors</h3>
              <p className="text-sm text-slate-500 font-semibold mb-6">128 registered donors in your area</p>
              <div className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50/80 px-4 py-2 rounded-xl w-fit border border-blue-100">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
                Online Now
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
