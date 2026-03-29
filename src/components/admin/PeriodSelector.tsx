"use client";

import { Pill } from "@/components/ui/Pill";

export type Period = "today" | "week" | "month" | "year";

interface PeriodSelectorProps {
  value: Period;
  onChange: (period: Period) => void;
  className?: string;
}

const PERIODS: { key: Period; label: string }[] = [
  { key: "today", label: "Aujourd'hui" },
  { key: "week", label: "Semaine" },
  { key: "month", label: "Mois" },
  { key: "year", label: "Annee" },
];

export function PeriodSelector({
  value,
  onChange,
  className = "",
}: PeriodSelectorProps) {
  return (
    <div className={`flex gap-2 overflow-x-auto scrollbar-none pb-1 ${className}`}>
      {PERIODS.map((p) => (
        <Pill
          key={p.key}
          label={p.label}
          active={p.key === value}
          onClick={() => onChange(p.key)}
        />
      ))}
    </div>
  );
}
