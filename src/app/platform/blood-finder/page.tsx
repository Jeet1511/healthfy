"use client";

import { useEffect, useMemo, useState } from "react";
import { ResourceWithDistance } from "@/backend/types";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function BloodFinderPage() {
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [location, setLocation] = useState("Delhi");
  const [results, setResults] = useState<ResourceWithDistance[]>([]);

  useEffect(() => {
    const query = new URLSearchParams({ bloodGroup, maxDistanceKm: "35" });
    fetch(`/api/resources?${query}`)
      .then((response) => response.json())
      .then((data) => {
        const list = (data.resources ?? []) as ResourceWithDistance[];
        setResults(list.filter((item) => item.type === "Blood Bank" || item.type === "Hospital"));
      });
  }, [bloodGroup, location]);

  const status = useMemo(() => {
    if (results.length >= 4) {
      return { label: "Available", className: "urgency-safe" };
    }
    if (results.length >= 1) {
      return { label: "Low", className: "urgency-moderate" };
    }
    return { label: "Critical", className: "urgency-critical" };
  }, [results.length]);

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <section className="panel-shell lg:col-span-2">
        <h3 className="text-xl font-semibold text-slate-100">Blood Finder Filters</h3>
        <div className="mt-4 space-y-3">
          <div>
            <p className="text-xs text-slate-400">Blood Group</p>
            <select value={bloodGroup} onChange={(event) => setBloodGroup(event.target.value)} className="auth-input mt-1">
              {bloodGroups.map((group) => (
                <option key={group}>{group}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-xs text-slate-400">Location</p>
            <input value={location} onChange={(event) => setLocation(event.target.value)} className="auth-input mt-1" placeholder="City or area" />
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/35 p-3">
          <p className="text-xs text-slate-400">Availability Status</p>
          <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
        </div>
      </section>

      <section className="panel-shell lg:col-span-3">
        <h3 className="text-xl font-semibold text-slate-100">Matching Sources</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {results.slice(0, 6).map((item) => (
            <article key={item.id} className="rounded-xl border border-white/10 bg-slate-900/35 p-3">
              <p className="font-medium text-slate-100">{item.name}</p>
              <p className="text-xs text-slate-300">{item.type} · {item.distanceKm} km</p>
              <p className="text-xs text-slate-300">{item.address}</p>
              <p className="mt-1 text-xs text-sky-200">{item.phone}</p>
            </article>
          ))}
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
          <iframe
            title="Blood finder map"
            src={`https://www.google.com/maps?q=${encodeURIComponent(`${bloodGroup} blood bank ${location}`)}&z=12&output=embed`}
            className="h-80 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </div>
  );
}
