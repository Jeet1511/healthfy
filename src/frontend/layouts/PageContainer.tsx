import { ReactNode } from "react";

type PageContainerProps = {
  title: string;
  subtitle: string;
  rightSlot?: ReactNode;
  children: ReactNode;
};

export function PageContainer({ title, subtitle, rightSlot, children }: PageContainerProps) {
  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <section className="rounded-4xl border border-white/80 bg-white/60 p-6 shadow-[0_12px_36px_rgba(0,0,0,0.06)] backdrop-blur-xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>
          </div>
          {rightSlot}
        </div>
      </section>
      {children}
    </div>
  );
}
