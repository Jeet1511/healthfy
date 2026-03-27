"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const router = useRouter();

  const continueWith = (session: "user" | "guest") => {
    localStorage.setItem("lifeline-session", session);
    router.push("/platform");
  };

  return (
    <div className="min-h-screen bg-command px-4 py-8 md:px-8">
      <div className="mx-auto max-w-md">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="panel-shell"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Entry</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-100">Welcome to LifeLine</h1>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`quick-pill ${mode === "login" ? "bg-white/10" : ""}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`quick-pill ${mode === "signup" ? "bg-white/10" : ""}`}
            >
              Sign up
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <input className="auth-input" placeholder="Email" />
            <input className="auth-input" placeholder="Password" type="password" />
            {mode === "signup" ? <input className="auth-input" placeholder="Confirm Password" type="password" /> : null}
          </div>

          <button type="button" className="primary-btn mt-4 w-full" onClick={() => continueWith("user")}>
            {mode === "login" ? "Login" : "Create account"}
          </button>

          <button type="button" className="quick-pill mt-3 w-full py-2 text-sm" onClick={() => continueWith("guest")}>
            Continue as Guest
          </button>

          <Link href="/" className="mt-4 inline-block text-xs text-slate-400 hover:text-slate-200">
            ← Back to landing
          </Link>
        </motion.section>
      </div>
    </div>
  );
}
