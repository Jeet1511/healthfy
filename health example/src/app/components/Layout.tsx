import { Outlet } from "react-router";
import { Navbar } from "./Navbar";
import { ScrollRestoration } from "react-router";
import { motion } from "motion/react";

export function Layout() {
  return (
    <div className="min-h-screen bg-[#F7FAFC] font-sans selection:bg-blue-200 relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.12] [mask-image:radial-gradient(ellipse_60%_80%_at_50%_0%,#000_70%,transparent_100%)]">
        <motion.div
          animate={{ y: [0, 64] }}
          transition={{ duration: 4, ease: "linear", repeat: Infinity }}
          className="absolute -inset-y-[64px] inset-x-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:4rem_4rem]"
        />
      </div>

      <Navbar />
      <main className="relative z-10">
        <Outlet />
      </main>
      <ScrollRestoration />
    </div>
  );
}
