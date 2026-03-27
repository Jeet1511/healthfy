"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { EmergencyResponse, ResourceWithDistance } from "@/backend/types";

type LiveMapProps = {
  triage: EmergencyResponse | null;
  highlightBlood: boolean;
};

export function LiveMap({ triage, highlightBlood }: LiveMapProps) {
  const [resources, setResources] = useState<ResourceWithDistance[]>([]);

  useEffect(() => {
    const maxDistanceKm = triage?.urgency === "Critical" ? "15" : "25";
    fetch(`/api/resources?maxDistanceKm=${maxDistanceKm}`)
      .then((response) => response.json())
      .then((data) => setResources(data.resources ?? []));
  }, [triage?.urgency]);

  const visible = useMemo(() => {
    if (!highlightBlood) {
      return resources.slice(0, 6);
    }

    const blood = resources.filter((resource) => resource.type === "Blood Bank");
    return blood.length ? blood : resources.slice(0, 6);
  }, [highlightBlood, resources]);

  const mapQuery = useMemo(() => {
    if (highlightBlood) {
      return "blood bank near me";
    }

    if (triage?.urgency === "Critical") {
      return "nearest trauma hospital";
    }

    return "hospitals near me";
  }, [highlightBlood, triage?.urgency]);

  return (
    <section className="panel-shell h-80 overflow-hidden">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Live Intelligence</p>
          <h3 className="text-lg font-semibold text-slate-900">Live Map</h3>
        </div>
        <span className="text-xs text-slate-600">{visible.length} nearby resources</span>
      </div>

      <div className="relative h-60 overflow-hidden rounded-xl border border-slate-200">
        <iframe
          title="Live emergency map"
          src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=12&output=embed`}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />

        <div className="pointer-events-none absolute inset-0">
          {visible.slice(0, 4).map((resource, index) => (
            <motion.span
              key={resource.id}
              className="map-marker-pulse"
              style={{
                left: `${22 + index * 18}%`,
                top: `${20 + (index % 2) * 34}%`,
              }}
              animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.4, 0.9, 0.4] }}
              transition={{ repeat: Infinity, duration: 2.2, delay: index * 0.2 }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
