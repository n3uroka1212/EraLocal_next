"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

interface DashboardProps {
  shop: {
    name: string;
    slug: string;
    verificationStatus: string;
    planType: string;
  };
  metrics: {
    productCount: number;
    pendingOrderCount: number;
    pendingPingCount: number;
  };
}

const QUICK_LINKS = [
  { href: "/vitrine", label: "Ma Vitrine", icon: "🏪" },
  { href: "/catalogue", label: "Catalogue", icon: "📦" },
  { href: "/commandes", label: "Commandes", icon: "🛒" },
  { href: "/boutique", label: "Profil Boutique", icon: "🏠" },
  { href: "/evenements", label: "Evenements", icon: "📅" },
  { href: "/reglages", label: "Reglages", icon: "⚙️" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "green" | "orange" | "red" }> = {
    verified: { label: "Verifie", variant: "green" },
    pending: { label: "En attente", variant: "orange" },
    rejected: { label: "Rejete", variant: "red" },
  };
  const s = map[status] ?? { label: status, variant: "orange" };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export function DashboardClient({ shop, metrics }: DashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">{shop.name}</h1>
          <p className="text-sm text-text2 mt-1">
            Code : <span className="font-mono">{shop.slug}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={shop.verificationStatus} />
          {shop.planType === "premium" && (
            <Badge variant="terra">Premium</Badge>
          )}
        </div>
      </div>

      {/* Metriques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Produits"
          value={metrics.productCount}
          icon="📦"
          href="/catalogue"
        />
        <MetricCard
          label="Commandes en attente"
          value={metrics.pendingOrderCount}
          icon="🛒"
          href="/commandes"
        />
        <MetricCard
          label="Pings en attente"
          value={metrics.pendingPingCount}
          icon="🔔"
          href="/pings"
        />
      </div>

      {/* Liens rapides */}
      <div>
        <h2 className="text-lg font-semibold text-text mb-3">Acces rapide</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 p-4 rounded-card bg-bg2 border border-border hover:border-terra hover:bg-terra-light/30 transition-all duration-200"
            >
              <span className="text-2xl">{link.icon}</span>
              <span className="text-sm font-medium text-text">
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  href,
}: {
  label: string;
  value: number;
  icon: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-5 rounded-card bg-bg2 border border-border hover:border-terra transition-colors"
    >
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-2xl font-bold text-text">{value}</p>
        <p className="text-xs text-text2">{label}</p>
      </div>
    </Link>
  );
}
