"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface BottomNavProps {
  items: NavItem[];
}

export function BottomNav({ items }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-bg2 border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors duration-200 ${
                active ? "text-terra" : "text-text3 hover:text-text2"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[0.6rem] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
