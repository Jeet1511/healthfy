import { motion } from "motion/react";
import { Navigation2, Clock } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

const hospitals = [
  {
    id: 1,
    name: "General General Hospital",
    distance: "1.2 mi",
    time: "5 mins",
    wait: "Low wait time",
    status: "good",
    image: "https://images.unsplash.com/photo-1769147555720-71fc71bfc216?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3NwaXRhbCUyMGJ1aWxkaW5nJTIwZXh0ZXJpb3J8ZW58MXx8fHwxNzc0NTEzMDc2fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 2,
    name: "City Medical Center",
    distance: "2.5 mi",
    time: "12 mins",
    wait: "High wait time",
    status: "busy",
    image: "https://images.unsplash.com/photo-1769147555720-71fc71bfc216?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3NwaXRhbCUyMGJ1aWxkaW5nJTIwZXh0ZXJpb3J8ZW58MXx8fHwxNzc0NTEzMDc2fDA&ixlib=rb-4.1.0&q=80&w=1080"
  }
];

export function HospitalList() {
  return (
    <div className="flex flex-col gap-3">
      {hospitals.map((hospital, idx) => (
        <motion.div
          key={hospital.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
        >
          <ImageWithFallback
            src={hospital.image}
            alt={hospital.name}
            className="w-16 h-16 rounded-xl object-cover"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 truncate">{hospital.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Navigation2 className="w-3 h-3" /> {hospital.time}
              </span>
              <span className="text-xs font-medium text-slate-500">{hospital.distance}</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <div className={`w-2 h-2 rounded-full ${hospital.status === 'good' ? 'bg-green-500' : 'bg-orange-500'}`} />
              <span className="text-xs font-medium text-slate-600">{hospital.wait}</span>
            </div>
          </div>
          
          <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors group-hover:scale-105 active:scale-95 shrink-0">
            <Navigation2 className="w-5 h-5" />
          </button>
        </motion.div>
      ))}
    </div>
  );
}
