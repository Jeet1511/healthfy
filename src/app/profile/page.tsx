import { PageContainer } from "@/frontend/layouts/PageContainer";
import { GlassCard } from "@/frontend/ui/GlassCard";

export default function ProfilePage() {
  return (
    <PageContainer
      title="Profile"
      subtitle="Manage your account, emergency identity, and response preferences."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="p-5 lg:col-span-1">
          <div className="mx-auto h-24 w-24 rounded-full bg-linear-to-br from-blue-600 to-teal-500"></div>
          <h2 className="mt-3 text-center text-lg font-bold text-slate-900">Dr. Sarah Jenkins</h2>
          <p className="text-center text-sm text-slate-500">Emergency Network Member</p>
        </GlassCard>

        <GlassCard className="p-5 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900">Emergency Details</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 text-sm text-slate-600">Primary Contact: +91 98765 43210</div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 text-sm text-slate-600">Blood Group: O+</div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 text-sm text-slate-600">Preferred Hospital: CityCare Multispeciality</div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 text-sm text-slate-600">Emergency Mode: Enabled</div>
          </div>
        </GlassCard>
      </div>
    </PageContainer>
  );
}
