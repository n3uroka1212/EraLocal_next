"use client";

import { Toggle } from "@/components/ui/Toggle";

const DAYS = [
  { key: "lundi", label: "Lundi" },
  { key: "mardi", label: "Mardi" },
  { key: "mercredi", label: "Mercredi" },
  { key: "jeudi", label: "Jeudi" },
  { key: "vendredi", label: "Vendredi" },
  { key: "samedi", label: "Samedi" },
  { key: "dimanche", label: "Dimanche" },
];

interface DaySchedule {
  open: boolean;
  start?: string;
  end?: string;
  lunchBreak?: boolean;
  lunchStart?: string;
  lunchEnd?: string;
}

type OpeningHours = Record<string, DaySchedule>;

const DEFAULT_HOURS: OpeningHours = Object.fromEntries(
  DAYS.map((d) => [
    d.key,
    { open: false, start: "09:00", end: "18:00", lunchBreak: false, lunchStart: "12:00", lunchEnd: "14:00" },
  ]),
);

interface OpeningHoursEditorProps {
  value: Record<string, unknown> | null;
  onChange: (value: Record<string, unknown>) => void;
}

export function OpeningHoursEditor({
  value,
  onChange,
}: OpeningHoursEditorProps) {
  const hours = (value as OpeningHours) ?? DEFAULT_HOURS;

  function updateDay(dayKey: string, updates: Partial<DaySchedule>) {
    const current = hours[dayKey] ?? DEFAULT_HOURS[dayKey];
    onChange({
      ...hours,
      [dayKey]: { ...current, ...updates },
    });
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-text">Horaires d'ouverture</h2>
      <div className="space-y-3">
        {DAYS.map(({ key, label }) => {
          const day = hours[key] ?? DEFAULT_HOURS[key];
          return (
            <div
              key={key}
              className="bg-bg2 border border-border rounded-card p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text">{label}</span>
                <Toggle
                  checked={day.open}
                  onChange={(checked) => updateDay(key, { open: checked })}
                />
              </div>

              {day.open && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={day.start ?? "09:00"}
                      onChange={(e) =>
                        updateDay(key, { start: e.target.value })
                      }
                      className="bg-bg3 border border-border rounded-input px-2 py-1 text-sm text-text"
                    />
                    <span className="text-text3">—</span>
                    <input
                      type="time"
                      value={day.end ?? "18:00"}
                      onChange={(e) =>
                        updateDay(key, { end: e.target.value })
                      }
                      className="bg-bg3 border border-border rounded-input px-2 py-1 text-sm text-text"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Toggle
                      checked={day.lunchBreak ?? false}
                      onChange={(checked) =>
                        updateDay(key, { lunchBreak: checked })
                      }
                      label="Pause dejeuner"
                    />
                  </div>

                  {day.lunchBreak && (
                    <div className="flex items-center gap-2 ml-4">
                      <input
                        type="time"
                        value={day.lunchStart ?? "12:00"}
                        onChange={(e) =>
                          updateDay(key, { lunchStart: e.target.value })
                        }
                        className="bg-bg3 border border-border rounded-input px-2 py-1 text-sm text-text"
                      />
                      <span className="text-text3">—</span>
                      <input
                        type="time"
                        value={day.lunchEnd ?? "14:00"}
                        onChange={(e) =>
                          updateDay(key, { lunchEnd: e.target.value })
                        }
                        className="bg-bg3 border border-border rounded-input px-2 py-1 text-sm text-text"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
