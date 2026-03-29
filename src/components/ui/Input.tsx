"use client";

import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  icon,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[0.68rem] font-semibold uppercase tracking-[0.5px] text-text2"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text3">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`w-full bg-bg3 border-[1.5px] border-border rounded-input px-3 py-2.5 text-sm text-text placeholder:text-text3 outline-none transition-all duration-200 focus:border-terra focus:ring-1 focus:ring-terra/20 ${icon ? "pl-10" : ""} ${error ? "border-red" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-[0.75rem] text-red">{error}</p>}
    </div>
  );
}
