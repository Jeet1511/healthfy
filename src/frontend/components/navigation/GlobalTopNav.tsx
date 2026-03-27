"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const links = [
  { label: "Home", href: "/", icon: "⌂" },
  { label: "Emergency AI", href: "/platform/emergency-ai", icon: "⚕" },
  { label: "Blood Finder", href: "/platform/blood-finder", icon: "🩸" },
  { label: "Map", href: "/platform/map-locator", icon: "🗺" },
  { label: "Crisis Mode", href: "/platform/crisis-mode", icon: "🚨" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

export function GlobalTopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sessionLabel = "Guest User";

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem("lifeline-theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolvedTheme = storedTheme ?? (prefersDark ? "dark" : "light");
    document.documentElement.dataset.theme = resolvedTheme;
  }, []);

  const toggleTheme = () => {
    const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    const nextTheme = current === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("lifeline-theme", nextTheme);
  };

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!dropdownRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const logout = () => {
    localStorage.removeItem("lifeline-session");
    setOpen(false);
    router.push("/auth");
  };

  return (
    <header className={`top-nav ${isScrolled ? "top-nav-scrolled" : ""}`}>
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-3 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="logo-dot" />
          <span className="text-base font-semibold tracking-wide text-slate-800">LifeLine</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`top-link ${isActive(pathname, link.href) ? "top-link-active" : ""}`}
            >
              <span aria-hidden>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <nav className="scrollbar-none absolute bottom-[-2.05rem] left-0 right-0 flex gap-1 overflow-x-auto border-t border-slate-200 bg-white/95 px-3 py-1.5 lg:hidden">
          {links.map((link) => (
            <Link
              key={`mobile-${link.href}`}
              href={link.href}
              className={`top-link whitespace-nowrap ${isActive(pathname, link.href) ? "top-link-active" : ""}`}
            >
              <span aria-hidden>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button type="button" onClick={toggleTheme} className="quick-pill" aria-label="Toggle theme">
            🌓 Theme
          </button>

          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="profile-trigger relative"
            >
              <span className="avatar-circle">JS</span>
              <span className="status-dot status-dot-safe absolute -right-0.5 -top-0.5" aria-hidden />
              <span className="hidden text-left sm:block">
                <span className="block text-xs text-slate-700">{sessionLabel}</span>
                <span className="block text-[11px] text-emerald-600">💓 Active · Safe</span>
              </span>
            </button>

            {open ? (
              <div className="profile-menu">
                <p className="text-sm font-semibold text-slate-800">{sessionLabel}</p>
                <p className="text-xs text-emerald-600">Status: 💓 Active / Safe</p>

                <div className="mt-3 space-y-1 border-t border-slate-200 pt-2">
                  <Link href="/platform/profile" className="profile-menu-item" onClick={() => setOpen(false)}>
                    👤 My Profile
                  </Link>
                  <Link href="/platform/settings" className="profile-menu-item" onClick={() => setOpen(false)}>
                    ⚙ Settings
                  </Link>
                  <button type="button" className="profile-menu-item w-full text-left" onClick={logout}>
                    ↩ Logout
                  </button>
                </div>

                <div className="mt-2 border-t border-slate-200 pt-2 text-[11px] text-slate-500">
                  Quick: <Link href="/platform/emergency-ai" onClick={() => setOpen(false)} className="text-blue-600">Emergency AI</Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="heartbeat-strip" aria-hidden>
        <div className="ecg-line" />
      </div>
    </header>
  );
}
