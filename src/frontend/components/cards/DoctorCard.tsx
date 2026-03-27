import Link from "next/link";
import { Star, Stethoscope, Clock } from "lucide-react";
import { ResourceWithDistance } from "@/backend/types";
import { GlassCard } from "@/frontend/ui/GlassCard";

type DoctorCardProps = {
  doctor: ResourceWithDistance;
};

export function DoctorCard({ doctor }: DoctorCardProps) {
  const rating = ((doctor.id.charCodeAt(0) % 8) / 10 + 4.2).toFixed(1);

  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{doctor.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
            <Stethoscope className="h-4 w-4 text-blue-500" /> {doctor.specialty}
          </p>
          <p className="mt-1 text-xs text-slate-500">{doctor.address}</p>
        </div>
        <div className="rounded-xl bg-amber-50 px-2 py-1 text-xs font-bold text-amber-600">
          <Star className="mr-1 inline h-3 w-3 fill-amber-400 text-amber-400" /> {rating}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 rounded-xl bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600">
          <Clock className="h-3 w-3" /> {doctor.distanceKm} km away
        </span>
        <Link href={`/doctors/${doctor.id}`} className="rounded-xl bg-linear-to-r from-blue-600 to-teal-500 px-3 py-1.5 text-xs font-bold text-white">
          View Profile
        </Link>
      </div>
    </GlassCard>
  );
}
