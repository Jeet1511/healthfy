import { motion, useScroll, useTransform } from "motion/react";
import { HeartPulse, Droplets, Car, ArrowRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useRef } from "react";

const scenarios = [
  {
    title: "Chest Pain",
    desc: "AI detects critical symptoms and automatically dispatches an ambulance while alerting the nearest cardiac center.",
    action: "Ambulance Suggestion",
    icon: HeartPulse,
    color: "rose",
    img: "https://images.unsplash.com/photo-1654588836262-fb473e1a34ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVzdCUyMHBhaW4lMjBtZWRpY2FsJTIwaGVscHxlbnwxfHx8fDE3NzQ2MDAwODN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    title: "Blood Needed",
    desc: "Locate compatible blood donors within a 5-mile radius and notify nearby hospitals with active blood banks.",
    action: "Find Nearby Sources",
    icon: Droplets,
    color: "red",
    img: "https://images.unsplash.com/photo-1683791895200-201c0c40310f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9vZCUyMGRvbmF0aW9uJTIwaGVhbHRoY2FyZXxlbnwxfHx8fDE3NzQ1NDE2NjR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    title: "Accident",
    desc: "Activates full emergency protocol, sending location data to police, paramedics, and your emergency contacts.",
    action: "Emergency Protocol",
    icon: Car,
    color: "orange",
    img: "https://images.unsplash.com/photo-1697952431905-9c8d169d9d2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbWJ1bGFuY2UlMjBlbWVyZ2VuY3klMjByZXNwb25kZXJzfGVufDF8fHx8MTc3NDYwMDA4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
];

export function Scenarios() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={containerRef} className="py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-20 relative">
          <motion.div style={{ y: y1 }} className="absolute -top-10 -left-20 w-32 h-32 bg-blue-200/30 rounded-full blur-[40px] -z-10" />
          <motion.div style={{ y: y2 }} className="absolute -bottom-10 -right-20 w-40 h-40 bg-teal-200/30 rounded-full blur-[50px] -z-10" />
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight"
          >
            Ready for Any Scenario
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-slate-600 font-light"
          >
            LifeLine adapts to the specific emergency, providing tailored
            responses and connecting you with the exact right resources.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto perspective-[1200px]">
          {scenarios.map((scenario, i) => (
            <motion.div
              key={scenario.title}
              initial={{ opacity: 0, y: 50, rotateX: 10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: i * 0.2, type: "spring" }}
              whileHover={{ y: -12, scale: 1.02, rotateY: 5 }}
              className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white group transition-all duration-500 transform-gpu"
            >
              <div className="h-56 overflow-hidden relative">
                <ImageWithFallback
                  src={scenario.img}
                  alt={scenario.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
                
                <div className="absolute bottom-5 left-5 text-white font-bold text-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <scenario.icon className="w-5 h-5 text-white" />
                  </div>
                  {scenario.title}
                </div>
              </div>
              
              <div className="p-8 relative">
                <div className="absolute top-0 right-8 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border border-slate-50 group-hover:-translate-y-2/3 transition-transform duration-500">
                  <ArrowRight className="w-5 h-5 text-blue-500 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                </div>
                
                <p className="text-slate-600 text-base leading-relaxed mb-8 min-h-[80px] font-medium opacity-90">
                  {scenario.desc}
                </p>
                
                <div className="inline-flex items-center text-blue-600 font-bold text-sm tracking-wide group-hover:text-blue-700 transition-colors bg-blue-50/50 px-4 py-2 rounded-xl">
                  {scenario.action}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
