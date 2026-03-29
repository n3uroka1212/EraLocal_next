"use client";

import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  id,
  className = "",
  rows = 4,
  ...props
}: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-[0.68rem] font-semibold uppercase tracking-[0.5px] text-text2"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={`w-full bg-bg3 border-[1.5px] border-border rounded-input px-3 py-2.5 text-sm text-text placeholder:text-text3 outline-none transition-all duration-200 focus:border-terra focus:ring-1 focus:ring-terra/20 resize-y ${error ? "border-red" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-[0.75rem] text-red">{error}</p>}
    </div>
  );
}
