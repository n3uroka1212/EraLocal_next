"use client";

import { useState, useMemo } from "react";
import { PeriodSelector, type Period } from "./PeriodSelector";
import { AnalyticsChart } from "./AnalyticsChart";
import { AnalyticsHeatmap } from "./AnalyticsHeatmap";

// --- Types ---

interface KpiData {
  totalVisits: number;
  newShops: number;
  orders: number;
  clients: number;
}

interface TopItem {
  label: string;
  value: number;
}

interface HeatmapCell {
  day: number;
  hour: number;
  count: number;
}

interface AnalyticsEvent {
  id: number;
  eventType: string;
  targetType: string | null;
  targetId: number | null;
  targetName: string | null;
  searchQuery: string | null;
  createdAt: string; // ISO string
}

export interface AnalyticsDashboardProps {
  events: AnalyticsEvent[];
  totals: {
    shops: number;
    orders: number;
    clients: number;
  };
}

// --- Helpers ---

function getStartDate(period: Period): Date {
  const now = new Date();
  switch (period) {
    case "today": {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "week": {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "month": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "year": {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 1);
      d.setHours(0, 0, 0, 0);
      return d;
    }
  }
}

function computeKpis(events: AnalyticsEvent[], totals: AnalyticsDashboardProps["totals"]): KpiData {
  const visits = events.filter((e) => e.eventType === "page_view").length;
  const newShops = totals.shops;
  const orders = totals.orders;
  const clients = totals.clients;
  return { totalVisits: visits, newShops, orders, clients };
}

function computeTop(
  events: AnalyticsEvent[],
  filterFn: (e: AnalyticsEvent) => boolean,
  keyFn: (e: AnalyticsEvent) => string | null,
  limit: number = 5,
): TopItem[] {
  const counts = new Map<string, number>();
  for (const ev of events) {
    if (!filterFn(ev)) continue;
    const key = keyFn(ev);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }));
}

function computeHeatmap(events: AnalyticsEvent[]): HeatmapCell[] {
  const cells = new Map<string, number>();
  for (const ev of events) {
    const d = new Date(ev.createdAt);
    // JS getDay: 0=Sun. We want 0=Mon.
    const jsDay = d.getDay();
    const day = jsDay === 0 ? 6 : jsDay - 1;
    const hour = d.getHours();
    const key = `${day}-${hour}`;
    cells.set(key, (cells.get(key) ?? 0) + 1);
  }
  return Array.from(cells.entries()).map((entry) => {
    const [key, count] = entry;
    const [day, hour] = key.split("-").map(Number);
    return { day, hour, count };
  });
}

// --- KPI Card ---

function KpiCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="flex items-center gap-4 p-5 rounded-card bg-bg2 border border-border">
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-2xl font-bold text-text tabular-nums">
          {value.toLocaleString("fr-FR")}
        </p>
        <p className="text-xs text-text2">{label}</p>
      </div>
    </div>
  );
}

// --- Main Component ---

export function AnalyticsDashboardClient({
  events,
  totals,
}: AnalyticsDashboardProps) {
  const [period, setPeriod] = useState<Period>("week");

  const filteredEvents = useMemo(() => {
    const start = getStartDate(period);
    return events.filter((e) => new Date(e.createdAt) >= start);
  }, [events, period]);

  const kpis = useMemo(
    () => computeKpis(filteredEvents, totals),
    [filteredEvents, totals],
  );

  const topBoutiques = useMemo(
    () =>
      computeTop(
        filteredEvents,
        (e) => e.targetType === "shop",
        (e) => e.targetName,
      ),
    [filteredEvents],
  );

  const topProduits = useMemo(
    () =>
      computeTop(
        filteredEvents,
        (e) => e.targetType === "product",
        (e) => e.targetName,
      ),
    [filteredEvents],
  );

  const topRecherches = useMemo(
    () =>
      computeTop(
        filteredEvents,
        (e) => e.eventType === "search" && !!e.searchQuery,
        (e) => e.searchQuery,
      ),
    [filteredEvents],
  );

  const heatmapData = useMemo(
    () => computeHeatmap(filteredEvents),
    [filteredEvents],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold font-serif text-text">Analytics</h1>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Visites totales" value={kpis.totalVisits} icon="👁" />
        <KpiCard label="Boutiques" value={kpis.newShops} icon="🏪" />
        <KpiCard label="Commandes" value={kpis.orders} icon="🛒" />
        <KpiCard label="Clients" value={kpis.clients} icon="👤" />
      </div>

      {/* Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AnalyticsChart
          title="Top 5 Boutiques"
          items={topBoutiques}
          color="bg-terra"
        />
        <AnalyticsChart
          title="Top 5 Produits"
          items={topProduits}
          color="bg-cyan"
        />
        <AnalyticsChart
          title="Top 5 Recherches"
          items={topRecherches}
          color="bg-purple"
        />
      </div>

      {/* Heatmap */}
      <AnalyticsHeatmap data={heatmapData} />
    </div>
  );
}
