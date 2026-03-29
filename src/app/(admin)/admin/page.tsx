import { prisma } from "@/lib/db/client";
import Link from "next/link";

export const metadata = { title: "Admin — Dashboard" };

export default async function AdminDashboardPage() {
  const [pendingShops, totalShops, totalOrders, totalClients, totalCities] =
    await Promise.all([
      prisma.shop.count({ where: { verificationStatus: "pending" } }),
      prisma.shop.count(),
      prisma.order.count(),
      prisma.client.count(),
      prisma.cityAccount.count(),
    ]);

  const stats = [
    {
      label: "Boutiques en attente",
      value: pendingShops,
      href: "/admin/boutiques",
      variant: pendingShops > 0 ? "orange" : "default",
    },
    {
      label: "Boutiques totales",
      value: totalShops,
      href: "/admin/boutiques",
      variant: "default",
    },
    {
      label: "Commandes",
      value: totalOrders,
      href: "#",
      variant: "default",
    },
    {
      label: "Clients",
      value: totalClients,
      href: "#",
      variant: "default",
    },
    {
      label: "Comptes ville",
      value: totalCities,
      href: "/admin/villes",
      variant: "default",
    },
  ] as const;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-serif font-bold text-text">Dashboard</h1>
        <p className="text-sm text-text2 mt-1">
          Vue d&apos;ensemble de la plateforme EraLocal
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group bg-bg2 border border-border rounded-card p-5 transition-all duration-200 hover:shadow-lg hover:border-terra/30"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-text2">
              {stat.label}
            </p>
            <p
              className={`text-3xl font-bold mt-2 ${
                stat.variant === "orange" ? "text-orange" : "text-text"
              }`}
            >
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-lg font-serif font-semibold text-text mb-3">
          Acces rapides
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/admin/boutiques"
            className="flex items-center gap-3 bg-bg2 border border-border rounded-card p-4 transition-all duration-200 hover:shadow hover:border-terra/30"
          >
            <span className="text-2xl">🏪</span>
            <div>
              <p className="font-semibold text-sm text-text">
                Verification boutiques
              </p>
              <p className="text-xs text-text2">
                {pendingShops} en attente de verification
              </p>
            </div>
          </Link>
          <Link
            href="/admin/villes"
            className="flex items-center gap-3 bg-bg2 border border-border rounded-card p-4 transition-all duration-200 hover:shadow hover:border-terra/30"
          >
            <span className="text-2xl">🏙️</span>
            <div>
              <p className="font-semibold text-sm text-text">Comptes ville</p>
              <p className="text-xs text-text2">
                Gerer les comptes municipaux
              </p>
            </div>
          </Link>
          <Link
            href="/admin/analytics"
            className="flex items-center gap-3 bg-bg2 border border-border rounded-card p-4 transition-all duration-200 hover:shadow hover:border-terra/30"
          >
            <span className="text-2xl">📈</span>
            <div>
              <p className="font-semibold text-sm text-text">Analytics</p>
              <p className="text-xs text-text2">Statistiques de la plateforme</p>
            </div>
          </Link>
          <Link
            href="/admin/backups"
            className="flex items-center gap-3 bg-bg2 border border-border rounded-card p-4 transition-all duration-200 hover:shadow hover:border-terra/30"
          >
            <span className="text-2xl">💾</span>
            <div>
              <p className="font-semibold text-sm text-text">Backups</p>
              <p className="text-xs text-text2">Sauvegardes de la base</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
