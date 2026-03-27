"use client";

import { Search } from "lucide-react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchBar({ value, onChange, placeholder = "Search...", className = "" }: SearchBarProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-[0_10px_26px_rgba(0,0,0,0.06)] backdrop-blur-xl ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full bg-transparent pl-10 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
      />
    </div>
  );
}
