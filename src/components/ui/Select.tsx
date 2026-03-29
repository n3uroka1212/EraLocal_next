"use client";

import type { SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({
  label,
  error,
  options,
  placeholder,
  id,
  className = "",
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="text-[0.68rem] font-semibold uppercase tracking-[0.5px] text-text2"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full bg-bg3 border-[1.5px] border-border rounded-input px-3 py-2.5 text-sm text-text outline-none transition-all duration-200 focus:border-terra focus:ring-1 focus:ring-terra/20 ${error ? "border-red" : ""} ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-[0.75rem] text-red">{error}</p>}
    </div>
  );
}
