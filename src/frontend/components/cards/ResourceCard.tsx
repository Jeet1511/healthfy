import { Droplet, AlertTriangle } from "lucide-react";
import { ResourceWithDistance } from "@/backend/types";
import { GlassCard } from "@/frontend/ui/GlassCard";

type ResourceCardProps = {
  resource: ResourceWithDistance;
  selectedGroup: string;
};

export function ResourceCard({ resource, selectedGroup }: ResourceCardProps) {
  const available = resource.bloodGroupsAvailable.includes(selectedGroup);

  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">{resource.name}</h3>
          <p className="mt-1 text-xs text-slate-500">{resource.type} • {resource.distanceKm} km</p>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold ${available ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
          {available ? <Droplet className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
          {available ? "Available" : "Low"}
        </span>
      </div>
      <p className="mt-3 text-xs text-slate-500">{resource.address}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {(resource.bloodGroupsAvailable.length ? resource.bloodGroupsAvailable : ["No blood data"]).map((group) => (
          <span key={group} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
            {group}
          </span>
        ))}
      </div>
    </GlassCard>
  );
}
