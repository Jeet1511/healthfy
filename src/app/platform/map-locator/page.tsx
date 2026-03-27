"use client";

import { useEffect, useMemo, useState } from "react";
import { ResourceWithDistance } from "@/backend/types";

const resourceTypes = ["Hospital", "Clinic", "Pharmacy"] as const;

export default function MapLocatorPage() {
  const [selectedType, setSelectedType] = useState<(typeof resourceTypes)[number]>("Hospital");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resources, setResources] = useState<ResourceWithDistance[]>([]);

  useEffect(() => {
    const query = new URLSearchParams({
      maxDistanceKm: "30",
      type: selectedType,
    });
    fetch(`/api/resources?${query}`)
      .then((response) => response.json())
      .then((data) => setResources(data.resources ?? []));
  }, [selectedType]);

  const selected = useMemo(
    () => resources.find((resource) => resource.id === selectedId) ?? resources[0],
    [resources, selectedId],
  );

  return (
    <div className="panel-shell">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-semibold text-slate-100">Map Locator</h3>
        <div className="flex gap-2">
          {resourceTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={`quick-pill ${selectedType === type ? "bg-white/10" : ""}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8 overflow-hidden rounded-xl border border-white/10">
          <iframe
            title="Resource map"
            src={`https://www.google.com/maps?q=${encodeURIComponent(selected ? `${selected.latitude},${selected.longitude}` : `${selectedType} near me`)}&z=12&output=embed`}
            className="h-[70vh] min-h-120 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="xl:col-span-4 max-h-[70vh] min-h-120 space-y-2 overflow-y-auto pr-1">
          {resources.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={`w-full rounded-xl border p-3 text-left transition ${
                selected?.id === item.id
                  ? "border-sky-400/50 bg-sky-500/10"
                  : "border-white/10 bg-slate-900/35 hover:bg-white/5"
              }`}
            >
              <p className="font-medium text-slate-100">{item.name}</p>
              <p className="text-xs text-slate-300">{item.address}</p>
              <p className="mt-1 text-xs text-sky-200">{item.distanceKm} km · {item.phone}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
