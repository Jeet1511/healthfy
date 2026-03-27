export default function SettingsPage() {
  return (
    <div className="panel-shell max-w-3xl">
      <h3 className="text-xl font-semibold text-slate-100">Settings</h3>
      <p className="mt-2 text-sm text-slate-300">
        Configure notification preferences, default emergency location, and privacy controls.
      </p>

      <div className="mt-4 space-y-3">
        <label className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/35 p-3 text-sm text-slate-200">
          Emergency push notifications
          <input type="checkbox" defaultChecked className="accent-sky-400" />
        </label>
        <label className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/35 p-3 text-sm text-slate-200">
          Share live location during crisis
          <input type="checkbox" defaultChecked className="accent-sky-400" />
        </label>
        <label className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/35 p-3 text-sm text-slate-200">
          Blood alert reminders
          <input type="checkbox" className="accent-sky-400" />
        </label>
      </div>
    </div>
  );
}
