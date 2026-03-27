export default function ProfilePage() {
  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <section className="panel-shell lg:col-span-3">
        <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
          ✅ Profile active · Emergency readiness status: Safe
        </div>

        <h3 className="text-xl font-semibold text-slate-100">Profile</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-slate-900/35 p-3">
            <p className="text-xs text-slate-400">Name</p>
            <p className="mt-1 text-slate-100">Jeet Sharma</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900/35 p-3">
            <p className="text-xs text-slate-400">Role</p>
            <p className="mt-1 text-slate-100">Primary Family Responder</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900/35 p-3">
            <p className="text-xs text-slate-400">Blood Group</p>
            <p className="mt-1 text-slate-100">O+</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900/35 p-3">
            <p className="text-xs text-slate-400">Primary City</p>
            <p className="mt-1 text-slate-100">Delhi</p>
          </div>
        </div>

        <div className="mt-5">
          <h4 className="text-sm font-semibold text-slate-200">Recent Activity</h4>
          <ul className="mt-2 space-y-2 text-sm text-slate-300">
            <li className="rounded-lg border border-white/10 bg-slate-900/35 p-3">10:04 · Updated emergency contact: Anita Sharma</li>
            <li className="rounded-lg border border-white/10 bg-slate-900/35 p-3">09:42 · Used Emergency AI for chest pain assessment</li>
            <li className="rounded-lg border border-white/10 bg-slate-900/35 p-3">09:39 · Searched O+ blood availability</li>
          </ul>
        </div>
      </section>

      <section className="panel-shell lg:col-span-2">
        <h3 className="text-xl font-semibold text-slate-100">Emergency Contacts</h3>
        <div className="mt-4 space-y-2">
          <div className="rounded-xl border border-white/10 bg-slate-900/35 p-3">
            <p className="text-slate-100">Anita Sharma</p>
            <p className="text-xs text-slate-300">Mother · +91 98765 21001</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900/35 p-3">
            <p className="text-slate-100">Rahul Sharma</p>
            <p className="text-xs text-slate-300">Brother · +91 98765 21002</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900/35 p-3">
            <p className="text-slate-100">Family Doctor</p>
            <p className="text-xs text-slate-300">Dr. Meera Joshi · +91 98765 10004</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/35 p-3 text-sm text-slate-300">
          <p className="font-medium text-slate-100">Quick Actions</p>
          <p className="mt-1">• Edit profile preferences</p>
          <p>• Add emergency contact</p>
          <p>• Export medical summary</p>
        </div>
      </section>
    </div>
  );
}
