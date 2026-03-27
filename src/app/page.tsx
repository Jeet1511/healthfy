"use client";

import { PlatformHero } from "@/frontend/components/home/PlatformHero";
import { DoctorSection } from "@/frontend/components/home/DoctorSection";
import { HospitalSection } from "@/frontend/components/home/HospitalSection";
import { ResourceNetwork } from "@/frontend/components/home/ResourceNetwork";
import { AiAssistantSection } from "@/frontend/components/home/AiAssistantSection";
import { ScrollBloodDrop } from "@/frontend/components/home/ScrollBloodDrop";
import { Footer } from "@/frontend/components/Footer";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#f8fafc] selection:bg-blue-200">
      <ScrollBloodDrop />

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        <div className="absolute left-[-10%] top-[-10%] h-[50%] w-[50%] rounded-full bg-blue-400/20 blur-[120px] mix-blend-multiply" />
        <div className="absolute right-[-10%] top-[20%] h-[60%] w-[40%] rounded-full bg-teal-400/20 blur-[120px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] left-[20%] h-[40%] w-[60%] rounded-full bg-sky-300/20 blur-[120px] mix-blend-multiply" />
      </div>

      <div className="relative z-10">
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
