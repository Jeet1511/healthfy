import Link from "next/link";
import { Building2, MapPin } from "lucide-react";
import { ResourceWithDistance } from "@/backend/types";
import { GlassCard } from "@/frontend/ui/GlassCard";

type HospitalCardProps = {
  hospital: ResourceWithDistance;
};

export function HospitalCard({ hospital }: HospitalCardProps) {
  return (
    <GlassCard className="p-5">
      <h3 className="text-lg font-bold text-slate-900">{hospital.name}</h3>
      <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
        <Building2 className="h-4 w-4 text-teal-500" /> {hospital.type} • {hospital.specialty}
      </p>
      <p className="mt-2 text-xs text-slate-500">{hospital.address}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 rounded-xl bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-600">
          <MapPin className="h-3 w-3" /> {hospital.distanceKm} km
        </span>
        <Link href={`/hospitals/${hospital.id}`} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700">
          Details
        </Link>
      </div>
    </GlassCard>
  );
}
