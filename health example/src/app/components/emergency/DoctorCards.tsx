import { motion } from "motion/react";
import { Star, Clock, Calendar, Video } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Jenkins",
    specialty: "Emergency Medicine",
    rating: 4.9,
    reviews: 128,
    availability: "Available Now",
    type: "telehealth",
    image: "https://images.unsplash.com/photo-1772987057599-2f1088c1e993?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBmZW1hbGUlMjBkb2N0b3IlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzQ1MDMwMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Cardiology Specialist",
    rating: 4.8,
    reviews: 94,
    availability: "In 15 mins",
    type: "in-person",
    image: "https://images.unsplash.com/photo-1615177393114-bd2917a4f74a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYWxlJTIwZG9jdG9yJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzc0NTEwNzM4fDA&ixlib=rb-4.1.0&q=80&w=1080"
  }
];

export function DoctorCards() {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {doctors.map((doctor, idx) => (
        <motion.div
          key={doctor.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          whileHover={{ y: -4, scale: 1.01 }}
          className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex gap-4">
            <div className="relative">
              <ImageWithFallback
                src={doctor.image}
                alt={doctor.name}
                className="w-16 h-16 rounded-2xl object-cover"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 leading-tight">{doctor.name}</h3>
                  <p className="text-xs font-medium text-slate-500">{doctor.specialty}</p>
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded-lg">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-bold text-yellow-700">{doctor.rating}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                {doctor.type === "telehealth" ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                    <Video className="w-3 h-3" /> Connect Now
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">
                    <Calendar className="w-3 h-3" /> Book Slot
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                  <Clock className="w-3 h-3" /> {doctor.availability}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
