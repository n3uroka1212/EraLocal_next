"use client";

import { useState } from "react";
import { Pill } from "@/components/ui/Pill";
import { EmptyState } from "@/components/ui/EmptyState";
import { OrderCard } from "./OrderCard";

type OrderStatus = "pending" | "paid" | "preparing" | "ready" | "collected" | "cancelled";

interface OrderSummary {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  clientName: string | null;
  createdAt: string;
  itemCount: number;
}

interface OrdersManagementClientProps {
  orders: OrderSummary[];
}

const STATUS_TABS: { label: string; value: "all" | OrderStatus }[] = [
  { label: "Toutes", value: "all" },
  { label: "En attente", value: "pending" },
  { label: "Payees", value: "paid" },
  { label: "En preparation", value: "preparing" },
  { label: "Pretes", value: "ready" },
  { label: "Recuperees", value: "collected" },
  { label: "Annulees", value: "cancelled" },
];

function countByStatus(orders: OrderSummary[], status: "all" | OrderStatus): number {
  if (status === "all") return orders.length;
  return orders.filter((o) => o.status === status).length;
}

export function OrdersManagementClient({ orders }: OrdersManagementClientProps) {
  const [activeTab, setActiveTab] = useState<"all" | OrderStatus>("all");

  const filtered =
    activeTab === "all" ? orders : orders.filter((o) => o.status === activeTab);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-text">Commandes</h1>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {STATUS_TABS.map((tab) => {
          const count = countByStatus(orders, tab.value);
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

      {/* Order list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="📦"
          title="Aucune commande"
          description={
            activeTab === "all"
              ? "Vous n'avez pas encore recu de commandes."
              : "Aucune commande avec ce statut."
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
