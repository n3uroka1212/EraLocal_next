"use client";

import { useState } from "react";

interface FavoriteButtonProps {
  active?: boolean;
  onToggle?: (active: boolean) => void;
  size?: "sm" | "md";
  className?: string;
}

export function FavoriteButton({
  active: initialActive = false,
  onToggle,
  size = "md",
  className = "",
}: FavoriteButtonProps) {
  const [active, setActive] = useState(initialActive);

  function handleClick() {
    const next = !active;
    setActive(next);
    onToggle?.(next);
  }

  const sizeClasses = size === "sm" ? "w-8 h-8 text-base" : "w-10 h-10 text-lg";

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-90 ${sizeClasses} ${className}`}
      aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      {active ? "\u2B50" : "\u2606"}
    </button>
  );
}
