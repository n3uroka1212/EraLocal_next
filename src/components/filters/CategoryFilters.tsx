"use client";

import { PillGroup } from "@/components/ui/PillGroup";

interface CategoryFiltersProps {
  categories: string[];
  value: string;
  onChange: (category: string) => void;
  className?: string;
}

export function CategoryFilters({
  categories,
  value,
  onChange,
  className,
}: CategoryFiltersProps) {
  return (
    <PillGroup
      options={["Tous", ...categories]}
      value={value}
      onChange={onChange}
      className={className}
    />
  );
}
