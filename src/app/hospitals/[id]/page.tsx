import Link from "next/link";
import { notFound } from "next/navigation";
import { MOCK_RESOURCES } from "@/backend/data/mockData";
import { PageContainer } from "@/frontend/layouts/PageContainer";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function HospitalDetailPage({ params }: Props) {
  const { id } = await params;
  const hospital = MOCK_RESOURCES.find((item) => item.id === id && (item.type === "Hospital" || item.type === "Clinic"));
  if (!hospital) notFound();

  return (
    <PageContainer title={hospital.name} subtitle={`${hospital.type} • ${hospital.address}`}>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-4xl border border-white/80 bg-white/60 p-6 shadow-[0_12px_36px_rgba(0,0,0,0.06)] lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-900">Facility Details</h2>
          <p className="mt-2 text-sm text-slate-600">Specialty focus: {hospital.specialty}</p>
          <p className="text-sm text-slate-600">Contact: {hospital.phone}</p>
          <p className="mt-3 text-sm text-slate-600">Available blood groups:</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(hospital.bloodGroupsAvailable.length ? hospital.bloodGroupsAvailable : ["No blood data"]).map((item) => (
              <span key={item} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{item}</span>
            ))}
          </div>
        </div>

        <div className="rounded-4xl border border-white/80 bg-white/60 p-6 shadow-[0_12px_36px_rgba(0,0,0,0.06)]">
          <h3 className="text-lg font-bold text-slate-900">Navigation</h3>
          <p className="mt-2 text-sm text-slate-600">Use map locator for fastest route and emergency handoff.</p>
          <Link href="/hospitals" className="mt-4 inline-block text-sm font-semibold text-blue-600">← Back to hospitals</Link>
        </div>
      </div>
    </PageContainer>
  );
}
