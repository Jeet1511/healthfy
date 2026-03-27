import { ButtonHTMLAttributes } from "react";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  subtle?: boolean;
};

export function PrimaryButton({ className = "", subtle = false, ...props }: PrimaryButtonProps) {
  return (
    <button
      {...props}
      className={`rounded-2xl px-5 py-2.5 text-sm font-bold transition-all ${
        subtle
          ? "border border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50"
          : "bg-linear-to-r from-blue-600 to-teal-500 text-white shadow-md hover:shadow-lg"
      } ${className}`}
    />
  );
}
