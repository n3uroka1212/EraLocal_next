"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { OrderStatusButtons } from "./OrderStatusButtons";
import { cancelOrder } from "@/actions/orders";

type OrderStatus = "pending" | "paid" | "preparing" | "ready" | "collected" | "cancelled";

interface OrderItem {
  id: number;
  productName: string;
  variantName: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface OrderDetail {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  platformFee: number;
  total: number;
  clientName: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  pickupTime: string | null;
  notes: string | null;
  cancelReason: string | null;
  cancelledBy: string | null;
  readyAt: string | null;
  collectedAt: string | null;
  createdAt: string;
  items: OrderItem[];
}

interface OrderDetailClientProps {
  order: OrderDetail;
}

const cancellableStatuses: OrderStatus[] = ["pending", "paid", "preparing"];

export function OrderDetailClient({ order: initialOrder }: OrderDetailClientProps) {
  const [order] = useState(initialOrder);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const canCancel = cancellableStatuses.includes(order.status);

  async function handleCancel() {
    setCancelLoading(true);
    setCancelError(null);

    const result = await cancelOrder(order.id);
    if (result.error) {
      setCancelError(result.error);
      setCancelLoading(false);
    } else {
      setShowCancelDialog(false);
      setCancelLoading(false);
      // Page will be revalidated by the server action
    }
  }

  return (
    <div className="space-y-6">
      {/* Back link + header */}
      <div>
        <Link
          href="/commandes"
          className="text-sm text-terra hover:underline inline-flex items-center gap-1 mb-3"
        >
          &larr; Retour aux commandes
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text font-mono">
              #{order.orderNumber}
            </h1>
            <div className="mt-1">
              <DateDisplay date={order.createdAt} />
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Client info */}
      <div className="p-4 rounded-card bg-bg2 border border-border">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text2 mb-3">
          Client
        </h2>
        <div className="space-y-1 text-sm">
          <p className="text-text font-medium">
            {order.clientName ?? "Client anonyme"}
          </p>
          {order.clientEmail && (
            <p className="text-text2">{order.clientEmail}</p>
          )}
          {order.clientPhone && (
            <p className="text-text2">{order.clientPhone}</p>
          )}
          {order.pickupTime && (
            <p className="text-text2">
              Retrait prevu :{" "}
              <DateDisplay date={order.pickupTime} />
            </p>
          )}
          {order.notes && (
            <p className="text-text3 italic mt-2">
              Note : {order.notes}
            </p>
          )}
        </div>
      </div>

      {/* Items table */}
      <div className="p-4 rounded-card bg-bg2 border border-border">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text2 mb-3">
          Articles
        </h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-b-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">
                  {item.productName}
                </p>
                {item.variantName && (
                  <p className="text-xs text-text3">{item.variantName}</p>
                )}
                <p className="text-xs text-text2">
                  {item.quantity} x{" "}
                  <PriceDisplay price={item.unitPrice} className="text-xs" />
                </p>
              </div>
              <PriceDisplay price={item.totalPrice} />
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-4 pt-3 border-t border-border space-y-1">
          <div className="flex justify-between text-sm text-text2">
            <span>Sous-total</span>
            <PriceDisplay price={order.subtotal} className="text-sm text-text2 font-normal" />
          </div>
          {order.platformFee > 0 && (
            <div className="flex justify-between text-sm text-text2">
              <span>Frais plateforme</span>
              <PriceDisplay price={order.platformFee} className="text-sm text-text2 font-normal" />
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-text pt-1">
            <span>Total</span>
            <PriceDisplay price={order.total} className="text-base" />
          </div>
        </div>
      </div>

      {/* Timeline info */}
      {(order.readyAt || order.collectedAt || order.cancelReason) && (
        <div className="p-4 rounded-card bg-bg2 border border-border">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text2 mb-3">
            Historique
          </h2>
          <div className="space-y-2 text-sm">
            {order.readyAt && (
              <p className="text-text2">
                Prete le <DateDisplay date={order.readyAt} />
              </p>
            )}
            {order.collectedAt && (
              <p className="text-text2">
                Recuperee le <DateDisplay date={order.collectedAt} />
              </p>
            )}
            {order.cancelReason && (
              <p className="text-red">
                Annulee{order.cancelledBy === "merchant" ? " par le marchand" : ""} :{" "}
                {order.cancelReason}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {order.status !== "collected" && order.status !== "cancelled" && (
        <div className="p-4 rounded-card bg-bg2 border border-border space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text2 mb-3">
            Actions
          </h2>
          <OrderStatusButtons
            orderId={order.id}
            currentStatus={order.status}
          />
          {canCancel && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowCancelDialog(true)}
            >
              Annuler la commande
            </Button>
          )}
          {cancelError && <p className="text-xs text-red">{cancelError}</p>}
        </div>
      )}

      {/* Cancel confirmation dialog */}
      <ConfirmDialog
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancel}
        title="Annuler la commande"
        message={`Etes-vous sur de vouloir annuler la commande #${order.orderNumber} ? Le client sera notifie.`}
        confirmLabel="Annuler la commande"
        variant="danger"
        loading={cancelLoading}
      />
    </div>
  );
}
