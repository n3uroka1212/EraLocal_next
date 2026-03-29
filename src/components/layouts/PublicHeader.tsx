"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-[100] bg-bg2 border-b border-border">
      <div className="flex items-center justify-between px-4 md:px-6 h-16">
        <Link href="/" className="font-serif font-bold text-xl text-terra">
          EraLocal
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-text2 hover:text-terra transition-colors"
          >
            Explorer
          </Link>
          <Link
            href="/evenements"
            className="text-sm font-medium text-text2 hover:text-terra transition-colors"
          >
            Evenements
          </Link>
          <Link
            href="/activites"
            className="text-sm font-medium text-text2 hover:text-terra transition-colors"
          >
            Activites
          </Link>
          <Link
            href="/soutien"
            className="text-sm font-medium text-text2 hover:text-terra transition-colors"
          >
            Soutien
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
