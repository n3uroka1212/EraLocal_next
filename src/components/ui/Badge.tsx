import type { ReactNode } from "react";

type BadgeVariant =
  | "green"
  | "orange"
  | "red"
  | "cyan"
  | "purple"
  | "terra"
  | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  green: "bg-green-light text-green",
  orange: "bg-[#FEF3C7] text-[#92400E]",
  red: "bg-red-light text-red",
  cyan: "bg-[rgba(6,182,212,.12)] text-cyan",
  purple: "bg-[rgba(168,85,247,.12)] text-purple",
  terra: "bg-terra-light text-terra",
  default: "bg-bg3 text-text2",
};

export function Badge({
  variant = "default",
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-input text-[0.75rem] font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
