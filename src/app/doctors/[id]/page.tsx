import Link from "next/link";
import { notFound } from "next/navigation";
import { MOCK_RESOURCES } from "@/backend/data/mockData";
import { PageContainer } from "@/frontend/layouts/PageContainer";
import { PrimaryButton } from "@/frontend/ui/PrimaryButton";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DoctorDetailPage({ params }: Props) {
  const { id } = await params;
  const doctor = MOCK_RESOURCES.find((item) => item.id === id && item.type === "Doctor");
  if (!doctor) notFound();

  return (
    <PageContainer title={doctor.name} subtitle={`${doctor.specialty} • ${doctor.address}`}>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-4xl border border-white/80 bg-white/60 p-6 shadow-[0_12px_36px_rgba(0,0,0,0.06)]">
          <div className="h-40 rounded-3xl bg-linear-to-br from-blue-500/20 to-teal-500/20" />
          <p className="mt-3 text-sm text-slate-600">Phone: {doctor.phone}</p>
          <p className="text-sm text-slate-600">Specialty: {doctor.specialty}</p>
          <PrimaryButton className="mt-4 w-full">Book Appointment</PrimaryButton>
        </div>

        <div className="rounded-4xl border border-white/80 bg-white/60 p-6 shadow-[0_12px_36px_rgba(0,0,0,0.06)] lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-900">Profile</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Experienced specialist in {doctor.specialty.toLowerCase()} care with emergency-ready consultation availability.
            LifeLine connects this profile to live map and emergency routing for faster treatment decisions.
          </p>
          <Link href="/doctors" className="mt-4 inline-block text-sm font-semibold text-blue-600">← Back to doctors</Link>
        </div>
      </div>
    </PageContainer>
  );
}
