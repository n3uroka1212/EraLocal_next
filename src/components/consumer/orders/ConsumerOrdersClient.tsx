"use client";

import { useState } from "react";
import Link from "next/link";
import { Pill } from "@/components/ui/Pill";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { EmptyState } from "@/components/ui/EmptyState";

type OrderStatus =
  | "pending"
  | "paid"
  | "preparing"
  | "ready"
  | "collected"
  | "cancelled";

interface OrderSummary {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  pickupTime: string | null;
  shopName: string;
  shopSlug: string;
  shopEmoji: string | null;
  itemCount: number;
}

interface ConsumerOrdersClientProps {
  orders: OrderSummary[];
}

type TabKey = "en_cours" | "passees";

const ACTIVE_STATUSES: OrderStatus[] = ["pending", "paid", "preparing", "ready"];
const PAST_STATUSES: OrderStatus[] = ["collected", "cancelled"];

const TABS: { label: string; value: TabKey }[] = [
  { label: "En cours", value: "en_cours" },
  { label: "Passees", value: "passees" },
];

export function ConsumerOrdersClient({ orders }: ConsumerOrdersClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("en_cours");

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const pastOrders = orders.filter((o) => PAST_STATUSES.includes(o.status));

  const filtered = activeTab === "en_cours" ? activeOrders : pastOrders;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold font-serif text-text">Mes commandes</h1>

      {/* Tab pills */}
      <div className="flex gap-2">
        {TABS.map((tab) => {
          const count =
            tab.value === "en_cours" ? activeOrders.length : pastOrders.length;
          return (
            <Pill
              key={tab.value}
              label={`${tab.label} (${count})`}
              active={activeTab === tab.value}
              onClick={() => setActiveTab(tab.value)}
            />
          );
        })}
      </div>

      {/* Order cards */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="📦"
          title={
            activeTab === "en_cours"
              ? "Aucune commande en cours"
              : "Aucune commande passee"
          }
          description={
            activeTab === "en_cours"
              ? "Vos commandes en cours apparaitront ici."
              : "Vos commandes terminees apparaitront ici."
          }
          action={
            activeTab === "en_cours" ? (
              <Link
                href="/"
                className="text-sm font-semibold text-terra hover:underline"
              >
                Explorer les boutiques
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <Link
              key={order.id}
              href={`/commandes/${order.orderNumber}`}
              className="block p-4 rounded-card bg-bg2 border border-border hover:border-terra transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-text font-mono">
                      #{order.orderNumber}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-text2 truncate flex items-center gap-1.5">
                    <span>{order.shopEmoji || "🏪"}</span>
                    {order.shopName}
                  </p>
                  <p className="text-xs text-text3 mt-0.5">
                    {order.itemCount} article{order.itemCount > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <PriceDisplay price={order.total} />
                  <div className="mt-1">
                    <DateDisplay date={order.createdAt} relative />
                  </div>
                </div>
              </div>
              {order.pickupTime && ACTIVE_STATUSES.includes(order.status) && (
                <div className="mt-2 pt-2 border-t border-border">
                  <p className="text-xs text-green flex items-center gap-1">
                    <span>🕐</span>
                    Retrait prevu :{" "}
                    <DateDisplay
                      date={order.pickupTime}
                      className="text-xs text-green"
                    />
                  </p>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
