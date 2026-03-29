"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { updateOrderStatus } from "@/actions/orders";

type OrderStatus = "pending" | "paid" | "preparing" | "ready" | "collected" | "cancelled";

interface OrderStatusButtonsProps {
  orderId: number;
  currentStatus: OrderStatus;
  onStatusChange?: () => void;
}

const nextAction: Record<string, { label: string; nextStatus: OrderStatus } | null> = {
  pending: null,
  paid: { label: "Confirmer la preparation", nextStatus: "preparing" },
  preparing: { label: "Marquer comme pret", nextStatus: "ready" },
  ready: { label: "Marquer comme recupere", nextStatus: "collected" },
  collected: null,
  cancelled: null,
};

export function OrderStatusButtons({
  orderId,
  currentStatus,
  onStatusChange,
}: OrderStatusButtonsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const action = nextAction[currentStatus];
  if (!action) return null;

  async function handleAdvance() {
    if (!action) return;
    setLoading(true);
    setError(null);

    const result = await updateOrderStatus(orderId, action.nextStatus);
    if (result.error) {
      setError(result.error);
    } else {
      onStatusChange?.();
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleAdvance} loading={loading}>
        {action.label}
      </Button>
      {error && <p className="text-xs text-red">{error}</p>}
    </div>
  );
}
