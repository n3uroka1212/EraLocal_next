"use client";

import { useState, type ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface ShopTabsProps {
  tabs: Tab[];
}

export function ShopTabs({ tabs }: ShopTabsProps) {
  const [active, setActive] = useState(tabs[0]?.id);

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto border-b border-border mb-4 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`shrink-0 px-4 py-2.5 text-sm font-medium transition-colors duration-200 border-b-2 ${
              active === tab.id
                ? "border-terra text-terra"
                : "border-transparent text-text2 hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{tabs.find((t) => t.id === active)?.content}</div>
    </div>
  );
}
