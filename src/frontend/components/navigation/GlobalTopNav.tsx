"use client";

import { motion } from "framer-motion";
import { HeartPulse, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ImageWithFallback } from "@/frontend/components/figma/ImageWithFallback";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Doctors", href: "/doctors" },
  { label: "Hospitals", href: "/hospitals" },
  { label: "Blood & Organs", href: "/blood-organs" },
  { label: "Emergency", href: "/emergency" },
  { label: "Map", href: "/map" },
  { label: "Profile", href: "/profile" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

export function GlobalTopNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-gray-100 bg-white/80 shadow-sm backdrop-blur-md"
          : "bg-white/50 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="group flex items-center gap-2">
            <div className="rounded-xl bg-red-50 p-2 transition-colors group-hover:bg-red-100">
              <HeartPulse className="h-6 w-6 text-red-500" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">LifeLine</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm font-medium transition-colors hover:text-blue-600 ${active ? "text-blue-600" : "text-slate-600"}`}
                >
                  {link.label}
                  {active ? (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-blue-600"
                    />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-6 md:flex">
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGF2YXRhcnxlbnwxfHx8fDE3NzQ1NzQzOTZ8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Profile avatar"
                className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm"
              />
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
            </div>
          </div>

          <button className="p-2 text-slate-600 md:hidden" onClick={() => setMobileMenuOpen((value) => !value)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border-b border-gray-100 bg-white shadow-lg md:hidden"
          >
            <div className="space-y-1 px-4 pb-6 pt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block rounded-md px-3 py-3 text-base font-medium ${
                    isActive(pathname, link.href)
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 flex items-center gap-3 border-t border-gray-100 px-3 pt-4">
                <div className="relative">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGF2YXRhcnxlbnwxfHx8fDE3NzQ1NzQzOTZ8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Profile avatar"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
                </div>
                <div className="text-sm font-medium text-slate-900">Dr. Sarah Jenkins</div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </div>
    </header>
  );
}
