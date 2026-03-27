"use client";

import { useMemo, useState } from "react";
import { useResources } from "@/frontend/hooks/useResources";
import { PageContainer } from "@/frontend/layouts/PageContainer";
import { MapContainer } from "@/frontend/components/MapContainer";

const types = ["All", "Doctor", "Hospital", "Clinic", "Blood Bank", "Pharmacy"];

export default function MapPage() {
  const [type, setType] = useState("All");
  const { resources } = useResources({ maxDistanceKm: 50 });

  const visible = useMemo(
    () => resources.filter((item) => type === "All" || item.type === type),
    [resources, type],
  );

  const query = useMemo(() => {
    if (type === "All") return "hospitals doctors blood banks near me";
    return `${type} near me`;
  }, [type]);

  return (
    <PageContainer
      title="Map"
      subtitle="Interactive map of doctors, hospitals, and critical resources."
      rightSlot={
        <select value={type} onChange={(event) => setType(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white/80 px-3 text-sm text-slate-700">
          {types.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      }
    >
      <div className="grid gap-4 lg:grid-cols-12">
        <MapContainer query={query} title="Resource Map" className="lg:col-span-8" />
        <div className="max-h-[420px] space-y-2 overflow-y-auto rounded-4xl border border-white/80 bg-white/60 p-4 shadow-[0_12px_36px_rgba(0,0,0,0.06)] backdrop-blur-xl lg:col-span-4">
          {visible.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white/80 p-3">
              <p className="font-semibold text-slate-900">{item.name}</p>
              <p className="text-xs text-slate-500">{item.type} • {item.specialty}</p>
              <p className="mt-1 text-xs text-blue-600">{item.distanceKm} km</p>
            </article>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
