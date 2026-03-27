import { motion } from "motion/react";
import { Building2, Clock, ShieldCheck } from "lucide-react";

const stats = [
  {
    icon: Building2,
    value: "500+",
    label: "Hospitals Connected",
    desc: "Instantly route to nearest facilities",
  },
  {
    icon: Clock,
    value: "<3s",
    label: "Real-time Response",
    desc: "Immediate emergency protocols activated",
  },
  {
    icon: ShieldCheck,
    value: "99.9%",
    label: "AI Triage Accuracy",
    desc: "Clinically validated intelligence",
  },
];

export function TrustSection() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background soft gradients */}
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-white via-blue-50/30 to-white -z-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-100/40 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-blue-100 text-blue-800 text-sm font-bold mb-8 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-blue-600" /> Trusted Healthcare Intelligence System
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
            Built for reliability when <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
              it matters most.
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto perspective-[1000px]">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50, rotateX: 15 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: i * 0.2, type: "spring" }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white/80 transition-all duration-500 transform-gpu relative overflow-hidden"
            >
              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/80 to-white/0 opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-out z-0" />
              
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-blue-50 to-blue-100/50 flex items-center justify-center mx-auto mb-8 text-blue-600 border border-blue-100 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <stat.icon className="w-10 h-10 drop-shadow-sm" />
                </div>
                <div className="text-5xl font-black text-slate-900 mb-4 tracking-tight drop-shadow-sm">
                  {stat.value}
                </div>
                <div className="text-xl font-bold text-slate-800 mb-3">
                  {stat.label}
                </div>
                <div className="text-slate-500 text-base font-medium">
                  {stat.desc}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
