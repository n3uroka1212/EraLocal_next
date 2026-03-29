"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { DateDisplay } from "@/components/ui/DateDisplay";

type OrderStatus = "pending" | "paid" | "preparing" | "ready" | "collected" | "cancelled";

interface OrderCardProps {
  order: {
    id: number;
    orderNumber: string;
    status: OrderStatus;
    total: number;
    clientName: string | null;
    createdAt: string;
    itemCount: number;
  };
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Link
      href={`/commandes/${order.id}`}
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
          <p className="text-xs text-text2 truncate">
            {order.clientName ?? "Client anonyme"}
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
    </Link>
  );
}
