import { motion } from "motion/react";
import { Brain, Droplets, ShieldAlert, Map, Stethoscope } from "lucide-react";
import { useState } from "react";

const features = [
  {
    title: "Emergency AI",
    description: "Instantly analyze symptoms and get real-time actionable medical guidance.",
    icon: Brain,
    color: "blue",
    hoverEffect: "pulse-glow",
    hasStethoscope: true,
  },
  {
    title: "Blood Finder",
    description: "Locate nearby blood donors and banks instantly in critical situations.",
    icon: Droplets,
    color: "red",
    hoverEffect: "bounce-drop",
  },
  {
    title: "Crisis Mode",
    description: "One-tap activation for severe emergencies to alert responders and contacts.",
    icon: ShieldAlert,
    color: "teal",
    hoverEffect: "alert-pulse",
  },
  {
    title: "Smart Map",
    description: "Find the fastest route to the nearest available hospital or clinic.",
    icon: Map,
    color: "green",
    hoverEffect: "map-pin",
  },
];

const colorMap = {
  blue: { bg: "bg-blue-50", text: "text-blue-500", glow: "hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.3)]", border: "hover:border-blue-200" },
  red: { bg: "bg-red-50", text: "text-red-500", glow: "hover:shadow-[0_20px_40px_-15px_rgba(239,68,68,0.3)]", border: "hover:border-red-200" },
  teal: { bg: "bg-teal-50", text: "text-teal-500", glow: "hover:shadow-[0_20px_40px_-15px_rgba(20,184,166,0.3)]", border: "hover:border-teal-200" },
  green: { bg: "bg-green-50", text: "text-green-500", glow: "hover:shadow-[0_20px_40px_-15px_rgba(34,197,94,0.3)]", border: "hover:border-green-200" },
};

export function Features() {
  return (
    <section className="py-24 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight"
          >
            Intelligent Care at Your Fingertips
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-slate-600 font-light"
          >
            A unified suite of tools designed to handle every stage of an emergency seamlessly, powered by context-aware AI.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colors = colorMap[feature.color as keyof typeof colorMap];
            const [isHovered, setIsHovered] = useState(false);

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: index * 0.1, type: "spring", stiffness: 100 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`group relative bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 border border-white/60 ${colors.glow} ${colors.border}`}
              >
                {/* Stethoscope Hover Effect for AI */}
                {feature.hasStethoscope && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                    animate={{ 
                      opacity: isHovered ? 0.15 : 0, 
                      scale: isHovered ? 1.5 : 0.5,
                      rotate: isHovered ? 15 : -45
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute -right-4 -top-4 pointer-events-none z-0"
                  >
                    <Stethoscope className="w-40 h-40 text-blue-500" />
                  </motion.div>
                )}

                <div className="relative z-10">
                  <motion.div
                    animate={isHovered && feature.hoverEffect === "pulse-glow" ? {
                      boxShadow: ["0px 0px 0px 0px rgba(59,130,246,0.4)", "0px 0px 0px 15px rgba(59,130,246,0)"]
                    } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                    className={`w-16 h-16 rounded-[1.25rem] ${colors.bg} ${colors.text} flex items-center justify-center mb-8 relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <motion.div
                      animate={
                        isHovered && feature.hoverEffect === "bounce-drop" ? { y: [0, -4, 0] } :
                        isHovered && feature.hoverEffect === "alert-pulse" ? { scale: [1, 1.1, 1] } :
                        isHovered && feature.hoverEffect === "map-pin" ? { y: [0, -4, 0], scale: [1, 1.1, 1] } : {}
                      }
                      transition={{ duration: 0.6, repeat: Infinity }}
                    >
                      <Icon className="w-8 h-8 relative z-10" />
                    </motion.div>
                  </motion.div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-base font-medium opacity-90">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
