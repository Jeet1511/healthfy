"use client";

import { useMemo, useState } from "react";
import { useResources } from "@/frontend/hooks/useResources";
import { getHospitals } from "@/frontend/utils/resourceGroups";
import { PageContainer } from "@/frontend/layouts/PageContainer";
import { SearchBar } from "@/frontend/components/SearchBar";
import { HospitalCard } from "@/frontend/components/cards/HospitalCard";

export default function HospitalsPage() {
  const [search, setSearch] = useState("");
  const { resources } = useResources({ maxDistanceKm: 60 });

  const hospitals = useMemo(() => {
    return getHospitals(resources).filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
  }, [resources, search]);

  return (
    <PageContainer
      title="Hospitals"
      subtitle="Browse hospitals and urgent care facilities with location intelligence."
      rightSlot={<span className="rounded-xl bg-teal-50 px-3 py-1 text-xs font-bold text-teal-600">{hospitals.length} centers</span>}
    >
      <SearchBar value={search} onChange={setSearch} placeholder="Search hospital or clinic..." />
      <div className="grid gap-4 md:grid-cols-2">
        {hospitals.map((hospital) => (
          <HospitalCard key={hospital.id} hospital={hospital} />
        ))}
      </div>
    </PageContainer>
  );
}
