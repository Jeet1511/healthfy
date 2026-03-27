import { motion } from "motion/react";
import { MapPin, Navigation, ArrowRight, Activity } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

const nearbyHospitals = [
  {
    id: 1,
    name: "General Hospital Center",
    type: "Public Hospital • ER Open",
    distance: "1.2 mi",
    time: "5 mins",
    status: "Normal Load",
    image: "https://images.unsplash.com/photo-1769147555720-71fc71bfc216?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3NwaXRhbCUyMGJ1aWxkaW5nJTIwZXh0ZXJpb3J8ZW58MXx8fHwxNzc0NTEzMDc2fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 2,
    name: "City Medical Center",
    type: "Specialty Clinic",
    distance: "2.5 mi",
    time: "12 mins",
    status: "Busy",
    image: "https://images.unsplash.com/photo-1758101512269-660feabf64fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjbGluaWMlMjBkb2N0b3IlMjBpbnNpZGV8ZW58MXx8fHwxNzc0NjA2NzczfDA&ixlib=rb-4.1.0&q=80&w=1080"
  }
];

export function HospitalSection() {
  return (
    <section className="py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Nearby Facilities</h2>
            <p className="text-slate-500 font-medium mt-3 text-lg">Find the closest hospitals and urgent care centers</p>
          </motion.div>
          <motion.button 
            whileHover={{ x: 5 }}
            className="hidden sm:flex items-center gap-2 text-teal-600 font-bold hover:text-teal-700 transition-colors bg-white/50 px-4 py-2 rounded-xl border border-white/80 backdrop-blur-sm"
          >
            View Map <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {nearbyHospitals.map((hospital, i) => (
            <motion.div
              key={hospital.id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="group flex flex-col sm:flex-row gap-6 bg-white/60 backdrop-blur-xl p-5 rounded-[2rem] border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all cursor-pointer"
            >
              <div className="sm:w-48 h-48 shrink-0 overflow-hidden rounded-[1.5rem] relative shadow-inner">
                <ImageWithFallback
                  src={hospital.image}
                  alt={hospital.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-3 left-3 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl text-xs font-extrabold text-slate-800 flex items-center gap-1.5 shadow-lg">
                  <Navigation className="w-3.5 h-3.5 text-blue-500" /> {hospital.time}
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center py-2">
                <h3 className="text-2xl font-bold text-slate-900 leading-tight mb-2 group-hover:text-teal-600 transition-colors">{hospital.name}</h3>
                <p className="text-sm text-slate-500 font-semibold mb-6 bg-slate-50/80 w-fit px-3 py-1 rounded-lg">{hospital.type}</p>
                
                <div className="flex flex-wrap items-center gap-3 mt-auto">
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-white/80 border border-slate-100 shadow-sm rounded-xl text-sm font-bold text-slate-700">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {hospital.distance}
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold shadow-sm ${
                    hospital.status === "Busy" ? "bg-orange-50 border border-orange-100 text-orange-600" : "bg-teal-50 border border-teal-100 text-teal-600"
                  }`}>
                    {hospital.status === "Busy" ? (
                      <Activity className="w-4 h-4 animate-pulse" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
                    )}
                    {hospital.status}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
