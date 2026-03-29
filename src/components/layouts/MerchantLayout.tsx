"use client";

import { Sidebar } from "./Sidebar";
import { BottomNav, type NavItem } from "./BottomNav";
import { ToastContainer } from "@/components/ui/Toast";

const MERCHANT_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/vitrine", label: "Vitrine", icon: "🏪" },
  { href: "/catalogue", label: "Catalogue", icon: "📦" },
  { href: "/commandes", label: "Commandes", icon: "🛒" },
  { href: "/evenements", label: "Evenements", icon: "📅" },
  { href: "/activites", label: "Activites", icon: "🎯" },
  { href: "/stock", label: "Stock", icon: "📋" },
  { href: "/scanner", label: "Scanner", icon: "📸" },
  { href: "/employes", label: "Employes", icon: "👥" },
  { href: "/pings", label: "Pings", icon: "🔔" },
  { href: "/reglages", label: "Reglages", icon: "⚙️" },
];

const MERCHANT_BOTTOM_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/vitrine", label: "Vitrine", icon: "🏪" },
  { href: "/catalogue", label: "Catalogue", icon: "📦" },
  { href: "/commandes", label: "Commandes", icon: "🛒" },
  { href: "/reglages", label: "Plus", icon: "⚙️" },
];

interface MerchantLayoutClientProps {
  children: React.ReactNode;
  isPremium?: boolean;
}

export function MerchantLayoutClient({
  children,
  isPremium,
}: MerchantLayoutClientProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar
        items={MERCHANT_NAV}
        title="EraLocal"
        badge={isPremium ? "Premium" : undefined}
      />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
      </div>
      <BottomNav items={MERCHANT_BOTTOM_NAV} />
      <ToastContainer />
    </div>
  );
}
