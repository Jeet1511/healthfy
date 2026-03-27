import { ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
};

export function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div className={`rounded-4xl border border-white/80 bg-white/60 shadow-[0_12px_36px_rgba(0,0,0,0.06)] backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}
