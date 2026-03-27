export default function SettingsPage() {
  return (
    <div className="panel-shell max-w-3xl">
      <h3 className="text-xl font-semibold text-slate-900">Settings</h3>
      <p className="mt-2 text-sm text-slate-600">
        Configure notification preferences, default emergency location, and privacy controls.
      </p>

      <div className="mt-4 space-y-3">
        <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          Emergency push notifications
          <input type="checkbox" defaultChecked className="accent-blue-500" />
        </label>
        <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          Share live location during crisis
          <input type="checkbox" defaultChecked className="accent-blue-500" />
        </label>
        <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          Blood alert reminders
          <input type="checkbox" className="accent-blue-500" />
        </label>
      </div>
    </div>
  );
}
