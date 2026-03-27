import { motion } from "motion/react";
import { Building2, Stethoscope, Car } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

const activeNodes = [
  { id: 1, type: "hospital", x: "25%", y: "30%", status: "available" },
  { id: 2, type: "hospital", x: "70%", y: "45%", status: "busy" },
  { id: 3, type: "doctor", x: "40%", y: "60%", status: "available" },
  { id: 4, type: "doctor", x: "65%", y: "20%", status: "available" },
  { id: 5, type: "doctor", x: "85%", y: "75%", status: "available" },
  { id: 6, type: "ambulance", x: "50%", y: "40%", status: "moving", destX: "25%", destY: "30%" },
];

export function LiveMap() {
  return (
    <div className="absolute inset-0 bg-[#E2E8F0] overflow-hidden">
      {/* Fallback Map Image or Stylized Base */}
      <ImageWithFallback
        src="https://images.unsplash.com/photo-1511526088318-f1a6d7646a05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMGxpZ2h0JTIwbWFwJTIwVUl8ZW58MXx8fHwxNzc0NjA1MTUyfDA&ixlib=rb-4.1.0&q=80&w=1080"
        alt="Map background"
        className="w-full h-full object-cover opacity-30 mix-blend-luminosity grayscale"
      />
      
      {/* SVG Stylized Roads */}
      <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" preserveAspectRatio="none">
        <path d="M0,100 Q300,120 400,250 T800,200" fill="none" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
        <path d="M200,0 L250,150 L500,150 L600,400" fill="none" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
        <path d="M700,0 Q650,200 800,300" fill="none" stroke="#94A3B8" strokeWidth="8" strokeLinecap="round" />
        <path d="M0,300 L900,150" fill="none" stroke="#CBD5E1" strokeWidth="3" strokeDasharray="10 10" />
      </svg>

      {/* User Location Pulse */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <motion.div
            animate={{ scale: [1, 3], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            className="absolute -inset-4 bg-blue-500 rounded-full"
          />
          <div className="w-5 h-5 bg-blue-600 rounded-full border-4 border-white shadow-lg relative z-10" />
        </div>
      </div>

      {/* Nodes Overlay */}
      {activeNodes.map((node) => {
        let Icon = Building2;
        let colorClass = "bg-blue-500";
        let glowClass = "bg-blue-500/30";
        let ringClass = "border-blue-200";

        if (node.type === "hospital") {
          Icon = Building2;
          colorClass = node.status === "busy" ? "bg-orange-500" : "bg-teal-500";
          glowClass = node.status === "busy" ? "bg-orange-500/30" : "bg-teal-500/30";
          ringClass = node.status === "busy" ? "border-orange-200" : "border-teal-200";
        } else if (node.type === "doctor") {
          Icon = Stethoscope;
          colorClass = "bg-indigo-500";
          glowClass = "bg-indigo-500/30";
          ringClass = "border-indigo-200";
        } else if (node.type === "ambulance") {
          Icon = Car;
          colorClass = "bg-red-500";
          glowClass = "bg-red-500/30";
          ringClass = "border-red-200";
        }

        const isMoving = node.type === "ambulance";

        return (
          <motion.div
            key={node.id}
            initial={{ x: node.x, y: node.y }}
            animate={isMoving ? { x: [node.x, node.destX as string], y: [node.y, node.destY as string] } : {}}
            transition={isMoving ? { duration: 10, repeat: Infinity, ease: "linear" } : {}}
            className="absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center group cursor-pointer"
            style={{ left: node.x, top: node.y }}
          >
            {/* Hover Tooltip */}
            <div className="absolute bottom-full mb-2 bg-white px-3 py-1.5 rounded-xl shadow-lg border border-slate-100 text-xs font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
              {node.type.charAt(0).toUpperCase() + node.type.slice(1)} 
              <span className="text-slate-400 font-medium ml-1">
                • {node.status}
              </span>
            </div>

            {/* Marker */}
            <div className={`absolute inset-0 ${glowClass} rounded-full blur-[8px] group-hover:blur-[12px] transition-all`} />
            <div className={`w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center relative z-20 ${colorClass}`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            {node.status === "available" && (
              <motion.div
                animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`absolute inset-0 rounded-full border-2 ${ringClass} z-10`}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
