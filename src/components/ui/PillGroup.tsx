"use client";

import { Pill } from "./Pill";

interface PillGroupProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function PillGroup({
  options,
  value,
  onChange,
  className = "",
}: PillGroupProps) {
  return (
    <div
      className={`flex gap-2 overflow-x-auto scrollbar-none pb-1 ${className}`}
    >
      {options.map((option) => (
        <Pill
          key={option}
          label={option}
          active={option === value}
          onClick={() => onChange(option)}
        />
      ))}
    </div>
  );
}
