"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "./BottomNav";

interface SidebarProps {
  items: NavItem[];
  title?: string;
  badge?: string;
}

export function Sidebar({ items, title, badge }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 h-screen sticky top-0 bg-bg2 border-r border-border">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        {title && (
          <span className="font-serif font-semibold text-lg text-text">
            {title}
          </span>
        )}
        {badge && (
          <span className="px-2 py-0.5 rounded-pill text-[0.65rem] font-semibold bg-terra text-white">
            {badge}
          </span>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-3 text-sm transition-colors duration-200 ${
                active
                  ? "bg-terra-light text-terra font-semibold border-r-2 border-terra"
                  : "text-text2 hover:bg-bg3 hover:text-text"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
