"use client";

interface PillProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Pill({
  label,
  active = false,
  onClick,
  className = "",
}: PillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 px-3.5 py-2 rounded-pill border-[1.5px] text-[0.8rem] font-semibold transition-all duration-200 cursor-pointer ${
        active
          ? "bg-terra border-terra text-white"
          : "bg-transparent border-border text-text2 hover:border-terra hover:text-terra"
      } ${className}`}
    >
      {label}
    </button>
  );
}
