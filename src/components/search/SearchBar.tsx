"use client";

import { useState, useRef, useEffect } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  onSearch,
  placeholder = "Rechercher une boutique, un produit...",
  className = "",
}: SearchBarProps) {
  const [value, setValue] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(value.trim());
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, onSearch]);

  return (
    <div className={`relative ${className}`}>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-bg3 border-[1.5px] border-border rounded-button px-4 py-3 pl-10 text-sm text-text placeholder:text-text3 outline-none transition-all duration-200 focus:border-terra focus:shadow-[0_2px_12px_rgba(199,107,74,.12)] animate-[searchGlow_3s_ease-in-out_infinite]"
      />
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text3 text-base">
        🔍
      </span>
      {value && (
        <button
          onClick={() => setValue("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text3 hover:text-text transition-colors text-sm"
          aria-label="Effacer"
        >
          &#x2715;
        </button>
      )}
    </div>
  );
}
