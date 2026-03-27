"use client";

import { HeartPulse } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900 py-12 text-sm text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link href="/" className="group flex items-center gap-2">
            <div className="rounded-xl bg-red-500/20 p-2 transition-colors group-hover:bg-red-500/30">
              <HeartPulse className="h-5 w-5 text-red-500" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">LifeLine</span>
          </Link>
          <div className="flex gap-6 text-slate-500">
            <Link href="#" className="transition-colors hover:text-slate-300">Privacy</Link>
            <Link href="#" className="transition-colors hover:text-slate-300">Terms</Link>
            <Link href="#" className="transition-colors hover:text-slate-300">Contact</Link>
          </div>
          <p>© 2026 LifeLine Healthcare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
