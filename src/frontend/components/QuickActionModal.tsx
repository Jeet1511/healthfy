"use client";

import { ReactNode } from "react";

type QuickActionModalProps = {
  open: boolean;
  title: string;
  content: ReactNode;
  onClose: () => void;
};

export function QuickActionModal({ open, title, content, onClose }: QuickActionModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-900/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-4xl border border-white/70 bg-white/90 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600">Close</button>
        </div>
        <div className="text-sm text-slate-700">{content}</div>
      </div>
    </div>
  );
}
