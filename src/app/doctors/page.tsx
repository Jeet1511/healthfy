"use client";

import { useMemo, useState } from "react";
import { useResources } from "@/frontend/hooks/useResources";
import { getDoctors } from "@/frontend/utils/resourceGroups";
import { PageContainer } from "@/frontend/layouts/PageContainer";
import { SearchBar } from "@/frontend/components/SearchBar";
import { DoctorCard } from "@/frontend/components/cards/DoctorCard";

const specialties = ["All", "Pediatrics", "Orthopedic", "Cardiology", "General"];

export default function DoctorsPage() {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const { resources } = useResources({ maxDistanceKm: 50 });

  const doctors = useMemo(() => {
    return getDoctors(resources)
      .filter((item) => specialty === "All" || item.specialty === specialty)
      .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
  }, [resources, specialty, search]);

  return (
    <PageContainer
      title="Doctors"
      subtitle="Find verified doctors by specialization, distance, and availability."
      rightSlot={<span className="rounded-xl bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">{doctors.length} results</span>}
    >
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <SearchBar value={search} onChange={setSearch} placeholder="Search doctor name..." />
        <select
          value={specialty}
          onChange={(event) => setSpecialty(event.target.value)}
          className="h-11 rounded-2xl border border-slate-200 bg-white/80 px-3 text-sm text-slate-700"
        >
          {specialties.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {doctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>
    </PageContainer>
  );
}
