import { motion } from "motion/react";
import { Star, Clock, ArrowRight, Stethoscope } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

const featuredDoctors = [
  {
    id: 1,
    name: "Dr. Sarah Jenkins",
    specialty: "Emergency Medicine",
    rating: 4.9,
    reviews: 128,
    availability: "Available Now",
    image: "https://images.unsplash.com/photo-1772987057599-2f1088c1e993?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBmZW1hbGUlMjBkb2N0b3IlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzQ1MDMwMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Cardiology Specialist",
    rating: 4.8,
    reviews: 94,
    availability: "In 15 mins",
    image: "https://images.unsplash.com/photo-1615177393114-bd2917a4f74a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYWxlJTIwZG9jdG9yJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzc0NTEwNzM4fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 3,
    name: "Dr. Emily Rostova",
    specialty: "Neurology",
    rating: 5.0,
    reviews: 210,
    availability: "Tomorrow, 9 AM",
    image: "https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGF2YXRhcnxlbnwxfHx8fDE3NzQ1NzQzOTZ8MA&ixlib=rb-4.1.0&q=80&w=1080"
  }
];

export function DoctorSection() {
  return (
    <section className="py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Find Verified Doctors</h2>
            <p className="text-slate-500 font-medium mt-3 text-lg">Top-rated specialists available for consultation</p>
          </motion.div>
          <motion.button 
            whileHover={{ x: 5 }}
            className="hidden sm:flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors bg-white/50 px-4 py-2 rounded-xl border border-white/80 backdrop-blur-sm"
          >
            See all doctors <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredDoctors.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all group relative overflow-hidden"
            >
              {/* Subtle hover gradient inside card */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              {/* Subtle Stethoscope Outline on hover */}
              <Stethoscope className="absolute right-[-10px] top-[-10px] w-32 h-32 text-blue-500/0 group-hover:text-blue-500/5 transition-colors duration-700 pointer-events-none rotate-12" />

              <div className="flex gap-5 relative z-10">
                <div className="relative shrink-0">
                  <ImageWithFallback
                    src={doc.image}
                    alt={doc.name}
                    className="w-24 h-24 rounded-2xl object-cover shadow-md border-2 border-white"
                  />
                  {doc.availability.includes("Now") && (
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-[3px] border-white rounded-full shadow-sm" 
                    />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-bold text-xl text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                    {doc.name}
                  </h3>
                  <p className="text-sm font-semibold text-slate-500 mb-3">{doc.specialty}</p>
                  <div className="flex items-center gap-1.5 text-sm bg-slate-50/80 w-fit px-2 py-1 rounded-lg">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-slate-700">{doc.rating}</span>
                    <span className="text-slate-400">({doc.reviews})</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-5 border-t border-slate-200/60 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <Clock className="w-4 h-4 text-blue-500" />
                  {doc.availability}
                </div>
                <button className="px-5 py-2.5 bg-blue-50/80 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                  Book Visit
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
