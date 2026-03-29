"use client";

import { Checkbox } from "@/components/ui/Checkbox";

const RECURRENCE_OPTIONS = [
  { value: "quotidien", label: "Quotidien" },
  { value: "hebdomadaire", label: "Hebdomadaire" },
  { value: "mensuel", label: "Mensuel" },
] as const;

const DAYS_OF_WEEK = [
  { value: "lun", label: "Lun" },
  { value: "mar", label: "Mar" },
  { value: "mer", label: "Mer" },
  { value: "jeu", label: "Jeu" },
  { value: "ven", label: "Ven" },
  { value: "sam", label: "Sam" },
  { value: "dim", label: "Dim" },
] as const;

interface RecurrenceSelectorProps {
  recurringDay: string;
  recurringDays: string;
  onRecurringDayChange: (value: string) => void;
  onRecurringDaysChange: (value: string) => void;
}

export function RecurrenceSelector({
  recurringDay,
  recurringDays,
  onRecurringDayChange,
  onRecurringDaysChange,
}: RecurrenceSelectorProps) {
  const selectedDays = recurringDays ? recurringDays.split(",").filter(Boolean) : [];

  function toggleDay(day: string) {
    const updated = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    onRecurringDaysChange(updated.join(","));
  }

  return (
    <div className="space-y-3 rounded-card bg-bg3 p-4">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.5px] text-text2">
        Frequence de recurrence
      </p>
      <div className="flex flex-wrap gap-2">
        {RECURRENCE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onRecurringDayChange(opt.value)}
            className={`px-3 py-1.5 rounded-input text-sm font-medium transition-colors ${
              recurringDay === opt.value
                ? "bg-terra text-white"
                : "bg-bg4 text-text2 hover:bg-bg4/80"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {recurringDay === "hebdomadaire" && (
        <div className="space-y-2 pt-2">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.5px] text-text2">
            Jours de la semaine
          </p>
          <div className="flex flex-wrap gap-3">
            {DAYS_OF_WEEK.map((day) => (
              <Checkbox
                key={day.value}
                checked={selectedDays.includes(day.value)}
                onChange={() => toggleDay(day.value)}
                label={day.label}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
