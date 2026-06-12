import { Save } from "lucide-react";
import { useState } from "react";

const Preferences = () => {
  const [preferences, setPreferences] = useState([
    {
      id: "emailNotifications",
      label: "Email Notifications",
      description: "Receive email notifications for prediction results and alerts",
      checked: true,
    },
    {
      id: "maintenanceReminders",
      label: "Maintenance Reminders",
      description: "Receive reminders when transformer maintenance is recommended",
      checked: true,
    },
  ]);

  const togglePreference = (id: string) => {
    setPreferences((prev) =>
      prev.map((pref) => (pref.id === id ? { ...pref, checked: !pref.checked } : pref)),
    );
  };

  return (
    <section id="Preferences">
      <div data-aos="zoom-in" data-aos-duration="500" className="space-y-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-semibold text-slate-900">Notification settings</h3>
          <p className="text-sm leading-5 text-slate-500">
            Shape the way Finexa reaches you with reminders and important updates.
          </p>
        </div>

        <div className="space-y-2.5">
          {preferences.map((pref) => (
            <div
              key={pref.id}
              className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-2.5"
            >
              <div className="flex items-center justify-between gap-4">
                <label className="text-sm font-medium leading-none text-slate-900" htmlFor={pref.id}>
                  {pref.label}
                </label>
                <input
                  type="checkbox"
                  id={pref.id}
                  className="h-4 w-4 rounded border-slate-200 bg-transparent accent-sky-400"
                  checked={pref.checked}
                  onChange={() => togglePreference(pref.id)}
                />
              </div>
              <p className="text-sm leading-5 text-slate-500">{pref.description}</p>
            </div>
          ))}
        </div>

        <button className="inline-flex h-10 items-center justify-center rounded-2xl bg-gradient-to-r from-sky-400 to-primary px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(14,165,233,0.24)] transition hover:from-sky-500 hover:to-sky-700">
          <Save size={18} color="#ffffff" strokeWidth={2} className="me-2" />
          Save Preferences
        </button>
      </div>
    </section>
  );
};

export default Preferences;
