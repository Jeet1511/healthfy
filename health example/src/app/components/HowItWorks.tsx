import { motion } from "motion/react";
import { MessageSquare, Sparkles, HeartHandshake } from "lucide-react";

const steps = [
  {
    num: 1,
    title: "Describe Situation",
    desc: "Simply tell LifeLine what's happening or tap an emergency preset.",
    icon: MessageSquare,
  },
  {
    num: 2,
    title: "AI Analyzes",
    desc: "Our medical intelligence instantly evaluates urgency and needs.",
    icon: Sparkles,
  },
  {
    num: 3,
    title: "Get Help Instantly",
    desc: "Connects you to exact resources and guides you through next steps.",
    icon: HeartHandshake,
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background element for depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-slate-200/40 rounded-[100%] blur-[100px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight"
          >
            How LifeLine Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-slate-600 max-w-2xl mx-auto font-light"
          >
            A seamless three-step process to get you the right help at the right time.
          </motion.p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[4.5rem] left-[10%] right-[10%] h-0.5 bg-slate-200/80 rounded-full" />
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="hidden md:block absolute top-[4.5rem] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-400 via-teal-400 to-blue-500 origin-left rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          />

          <div className="grid md:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: i * 0.3, type: "spring" }}
                className="flex flex-col items-center text-center group"
              >
                <motion.div 
                  whileHover={{ y: -5, scale: 1.05 }}
                  className="w-28 h-28 mb-8 rounded-[2rem] bg-white/80 backdrop-blur-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] flex items-center justify-center border border-white relative transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.3 + 0.3, type: "spring" }}
                    className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg z-20 transform rotate-12 group-hover:rotate-0 transition-transform duration-300"
                  >
                    {step.num}
                  </motion.div>
                  <step.icon className="w-12 h-12 text-blue-600 relative z-10 group-hover:text-blue-500 transition-colors" />
                </motion.div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-slate-600 leading-relaxed px-4 text-base font-medium">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
