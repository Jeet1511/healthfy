import { PlatformHero } from "../components/home/PlatformHero";
import { DoctorSection } from "../components/home/DoctorSection";
import { HospitalSection } from "../components/home/HospitalSection";
import { ResourceNetwork } from "../components/home/ResourceNetwork";
import { AiAssistantSection } from "../components/home/AiAssistantSection";
import { ScrollBloodDrop } from "../components/home/ScrollBloodDrop";
import { Footer } from "../components/Footer";
import { motion } from "motion/react";

export function Home() {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#f8fafc] selection:bg-blue-200">
      {/* Scroll Storytelling */}
      <ScrollBloodDrop />

      {/* Premium Animated Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Soft Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        {/* Animated Blobs */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[120px] mix-blend-multiply"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-teal-400/20 blur-[120px] mix-blend-multiply"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, 100, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] rounded-full bg-sky-300/20 blur-[120px] mix-blend-multiply"
        />
      </div>

      <div className="relative z-10">
        {/* Main Platform Sections */}
        <PlatformHero />
        <DoctorSection />
        <HospitalSection />
        <ResourceNetwork />
        <AiAssistantSection />
        <Footer />
      </div>
    </div>
  );
}
