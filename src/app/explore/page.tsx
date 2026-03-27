"use client";

import Link from "next/link";
import { useResources } from "@/frontend/hooks/useResources";
import { PageContainer } from "@/frontend/layouts/PageContainer";
import { GlassCard } from "@/frontend/ui/GlassCard";

export default function ExplorePage() {
  const { resources, loading } = useResources({ maxDistanceKm: 40 });

  return (
    <PageContainer
      title="Explore Healthcare Network"
      subtitle="Discover doctors, hospitals, blood resources, and emergency services around you."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/doctors" className="rounded-3xl border border-white/80 bg-white/70 p-5 font-bold text-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">Doctors</Link>
        <Link href="/hospitals" className="rounded-3xl border border-white/80 bg-white/70 p-5 font-bold text-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">Hospitals</Link>
        <Link href="/blood-organs" className="rounded-3xl border border-white/80 bg-white/70 p-5 font-bold text-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">Blood & Organs</Link>
      </div>

      <GlassCard className="p-5">
        <h2 className="text-xl font-bold text-slate-900">Nearby Resources</h2>
        {loading ? <p className="mt-3 text-sm text-slate-500">Loading resources...</p> : null}
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {resources.slice(0, 12).map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white/80 p-3">
              <p className="font-semibold text-slate-900">{item.name}</p>
              <p className="text-xs text-slate-500">{item.type} • {item.specialty}</p>
              <p className="mt-1 text-xs text-blue-600">{item.distanceKm} km</p>
            </article>
          ))}
        </div>
      </GlassCard>
    </PageContainer>
  );
}
