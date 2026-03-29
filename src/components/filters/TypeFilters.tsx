"use client";

import { PillGroup } from "@/components/ui/PillGroup";

const TYPES = ["Tous", "Commercant", "Producteur", "Artisan"];

interface TypeFiltersProps {
  value: string;
  onChange: (type: string) => void;
  className?: string;
}

export function TypeFilters({ value, onChange, className }: TypeFiltersProps) {
  return <PillGroup options={TYPES} value={value} onChange={onChange} className={className} />;
}
