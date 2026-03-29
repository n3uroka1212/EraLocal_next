"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const isDark = stored === "dark" || (!stored && prefersDark);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      className="w-10 h-10 flex items-center justify-center rounded-full border-[1.5px] border-border bg-bg3 text-lg hover:scale-105 active:scale-95 transition-all duration-200"
      aria-label={dark ? "Mode clair" : "Mode sombre"}
    >
      {dark ? "\u2600\uFE0F" : "\uD83C\uDF19"}
    </button>
  );
}
