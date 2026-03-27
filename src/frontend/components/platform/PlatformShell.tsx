"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

type PlatformShellProps = {
  children: ReactNode;
};

const navItems = [
  { label: "Dashboard", href: "/platform", icon: "⌂" },
  { label: "Emergency AI", href: "/platform/emergency-ai", icon: "⚕" },
  { label: "Blood Finder", href: "/platform/blood-finder", icon: "🩸" },
  { label: "Map Locator", href: "/platform/map-locator", icon: "🗺" },
  { label: "Crisis Mode", href: "/platform/crisis-mode", icon: "🚨" },
  { label: "Profile", href: "/platform/profile", icon: "👤" },
] as const;

export function PlatformShell({ children }: PlatformShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState("guest");

  const title = useMemo(() => {
    const match = navItems.find((item) => item.href === pathname);
    if (match?.label) {
      return match.label;
    }

    if (pathname === "/platform/settings") {
      return "Settings";
    }

    return "Dashboard";
  }, [pathname]);

  useEffect(() => {
    setSessionType(localStorage.getItem("lifeline-session") ?? "guest");
  }, [pathname]);

  const signOut = () => {
    localStorage.removeItem("lifeline-session");
    router.push("/auth");
  };

  return (
    <div className="min-h-screen bg-command px-4 py-4 md:px-6">
      <div className="mx-auto grid max-w-screen-2xl gap-4 xl:grid-cols-[260px_1fr_300px]">
        <aside className="panel-shell sticky top-24 flex h-[calc(100vh-7rem)] flex-col">
          <Link href="/" className="mb-6 block border-b border-slate-200 pb-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">LifeLine</p>
            <h1 className="text-xl font-semibold text-slate-900">Response Platform</h1>
          </Link>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${active ? "sidebar-link-active" : ""}`}
                  onMouseEnter={() => setHovered(item.href)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <span aria-hidden>{item.icon}</span>
                  <span>{item.label}</span>
                  {hovered === item.href && !active ? <span className="ml-auto text-xs text-slate-500">↗</span> : null}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3 border-t border-slate-200 pt-4">
            <p className="text-xs text-slate-500">Session: <span className="text-slate-800">{sessionType}</span></p>
            <button type="button" className="quick-pill w-full text-left" onClick={signOut}>
              Sign out
            </button>
          </div>
        </aside>

        <section className="space-y-4">
          <header className="status-shell">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Platform</p>
                <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="status-chip status-chip-live">AI Active</span>
                <span className="status-chip status-chip-live">Location Synced</span>
              </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </section>

        <aside className="panel-shell sticky top-24 h-[calc(100vh-7rem)]">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Context Panel</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">Live System Intel</h3>

          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Emergency Queue</p>
              <p className="mt-1 font-medium text-slate-900">3 active incidents</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Nearest Trauma Unit</p>
              <p className="mt-1 font-medium text-slate-900">Rapid Trauma Institute · 4.1 km</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Blood Alert</p>
              <p className="mt-1 font-medium text-slate-900">O- stock low in 2 centers</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
