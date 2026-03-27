"use client";

import { useMemo, useState } from "react";
import { useResources } from "@/frontend/hooks/useResources";
import { getBloodResources } from "@/frontend/utils/resourceGroups";
import { PageContainer } from "@/frontend/layouts/PageContainer";
import { ResourceCard } from "@/frontend/components/cards/ResourceCard";
import { SearchBar } from "@/frontend/components/SearchBar";

const groups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function BloodOrgansPage() {
  const [group, setGroup] = useState("O-");
  const [search, setSearch] = useState("");
  const { resources } = useResources({ bloodGroup: group, maxDistanceKm: 60 });

  const list = useMemo(() => {
    return getBloodResources(resources).filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
  }, [resources, search]);

  return (
    <PageContainer
      title="Blood & Organs"
      subtitle="Track availability, donor-ready resources, and urgency indicators in real time."
    >
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <SearchBar value={search} onChange={setSearch} placeholder="Search blood bank or hospital..." />
        <select value={group} onChange={(event) => setGroup(event.target.value)} className="h-11 rounded-2xl border border-slate-200 bg-white/80 px-3 text-sm text-slate-700">
          {groups.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((item) => (
          <ResourceCard key={item.id} resource={item} selectedGroup={group} />
        ))}
      </div>
    </PageContainer>
  );
}
