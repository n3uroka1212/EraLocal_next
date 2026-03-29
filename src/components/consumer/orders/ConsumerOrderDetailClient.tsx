"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { DateDisplay } from "@/components/ui/DateDisplay";

type OrderStatus =
  | "pending"
  | "paid"
  | "preparing"
  | "ready"
  | "collected"
  | "cancelled";

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
  pickupTime: string | null;
  notes: string | null;
  cancelReason: string | null;
  cancelledBy: string | null;
  readyAt: string | null;
  collectedAt: string | null;
  createdAt: string;
  shopName: string;
  shopSlug: string;
  shopEmoji: string | null;
  shopPhone: string | null;
  ccInstructions: string | null;
  items: OrderItem[];
}

interface ConsumerOrderDetailClientProps {
  order: OrderDetail;
}

// Timeline steps in order
const TIMELINE_STEPS: { status: OrderStatus; label: string; icon: string }[] = [
  { status: "pending", label: "Commande passee", icon: "📝" },
  { status: "paid", label: "Paiement confirme", icon: "💳" },
  { status: "preparing", label: "En preparation", icon: "👨‍🍳" },
  { status: "ready", label: "Prete a retirer", icon: "✅" },
  { status: "collected", label: "Recuperee", icon: "🎉" },
];

const STATUS_ORDER: Record<OrderStatus, number> = {
  pending: 0,
  paid: 1,
  preparing: 2,
  ready: 3,
  collected: 4,
  cancelled: -1,
};

function getStepState(
  stepStatus: OrderStatus,
  currentStatus: OrderStatus,
): "completed" | "current" | "upcoming" {
  const stepIdx = STATUS_ORDER[stepStatus];
  const currentIdx = STATUS_ORDER[currentStatus];

  if (currentStatus === "cancelled") return "upcoming";
  if (stepIdx < currentIdx) return "completed";
  if (stepIdx === currentIdx) return "current";
  return "upcoming";
}

export function ConsumerOrderDetailClient({
  order,
}: ConsumerOrderDetailClientProps) {
  const isCancelled = order.status === "cancelled";

  return (
    <div className="p-4 space-y-6">
      {/* Back link + header */}
      <div>
        <Link
          href="/commandes"
          className="text-sm text-terra hover:underline inline-flex items-center gap-1 mb-3"
        >
          &larr; Mes commandes
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

      {/* Shop info */}
      <div className="p-4 rounded-card bg-bg2 border border-border">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text2 mb-3">
          Boutique
        </h2>
        <Link
          href={`/boutiques/${order.shopSlug}`}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-terra-light text-lg">
            {order.shopEmoji || "🏪"}
          </div>
          <div>
            <p className="text-sm font-semibold text-text">{order.shopName}</p>
            {order.shopPhone && (
              <p className="text-xs text-text2">{order.shopPhone}</p>
            )}
          </div>
        </Link>
      </div>

      {/* Status timeline */}
      {!isCancelled && (
        <div className="p-4 rounded-card bg-bg2 border border-border">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text2 mb-4">
            Suivi
          </h2>
          <div className="relative">
            {TIMELINE_STEPS.map((step, idx) => {
              const state = getStepState(step.status, order.status);
              const isLast = idx === TIMELINE_STEPS.length - 1;

              return (
                <div key={step.status} className="flex gap-3 relative">
                  {/* Vertical connector line */}
                  {!isLast && (
                    <div
                      className={`absolute left-[15px] top-[30px] w-0.5 h-[calc(100%-6px)] ${
                        state === "completed" ? "bg-[#6B9B7A]" : "bg-border"
                      }`}
                    />
                  )}

                  {/* Circle indicator */}
                  <div
                    className={`relative z-10 shrink-0 w-[30px] h-[30px] rounded-full flex items-center justify-center text-sm border-2 ${
                      state === "completed"
                        ? "bg-[#6B9B7A] border-[#6B9B7A] text-white"
                        : state === "current"
                          ? "bg-white border-[#C76B4A] text-[#C76B4A]"
                          : "bg-bg3 border-border text-text3"
                    }`}
                  >
                    {state === "completed" ? "✓" : step.icon}
                  </div>

                  {/* Label */}
                  <div className={`pb-6 pt-1 ${isLast ? "pb-0" : ""}`}>
                    <p
                      className={`text-sm font-medium ${
                        state === "completed"
                          ? "text-[#6B9B7A]"
                          : state === "current"
                            ? "text-text font-semibold"
                            : "text-text3"
                      }`}
                    >
                      {step.label}
                    </p>
                    {state === "current" && step.status === "ready" && (
                      <p className="text-xs text-[#6B9B7A] mt-0.5">
                        Votre commande est prete !
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancelled banner */}
      {isCancelled && (
        <div className="p-4 rounded-card bg-[#D45A3A]/10 border border-[#D45A3A]/30">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">❌</span>
            <h2 className="text-sm font-semibold text-[#D45A3A]">
              Commande annulee
            </h2>
          </div>
          {order.cancelReason && (
            <p className="text-sm text-text2 mt-1">
              Raison : {order.cancelReason}
            </p>
          )}
          {order.cancelledBy && (
            <p className="text-xs text-text3 mt-0.5">
              Annulee par :{" "}
              {order.cancelledBy === "merchant" ? "le marchand" : "le client"}
            </p>
          )}
        </div>
      )}

      {/* Pickup info */}
      {(order.pickupTime || order.ccInstructions) && (
        <div className="p-4 rounded-card bg-bg2 border border-border">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text2 mb-3">
            Retrait
          </h2>
          <div className="space-y-2 text-sm">
            {order.pickupTime && (
              <p className="text-text flex items-center gap-2">
                <span>🕐</span>
                <span>
                  Heure prevue :{" "}
                  <DateDisplay date={order.pickupTime} className="text-sm text-text font-medium" />
                </span>
              </p>
            )}
            {order.ccInstructions && (
              <p className="text-text2 flex items-start gap-2">
                <span className="shrink-0">📍</span>
                <span>{order.ccInstructions}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {order.notes && (
        <div className="p-4 rounded-card bg-bg2 border border-border">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text2 mb-2">
            Notes
          </h2>
          <p className="text-sm text-text2 italic">{order.notes}</p>
        </div>
      )}

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
            <PriceDisplay
              price={order.subtotal}
              className="text-sm text-text2 font-normal"
            />
          </div>
          {order.platformFee > 0 && (
            <div className="flex justify-between text-sm text-text2">
              <span>Frais de service</span>
              <PriceDisplay
                price={order.platformFee}
                className="text-sm text-text2 font-normal"
              />
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-text pt-1">
            <span>Total</span>
            <PriceDisplay price={order.total} className="text-base" />
          </div>
        </div>
      </div>

      {/* History timestamps */}
      {(order.readyAt || order.collectedAt) && (
        <div className="p-4 rounded-card bg-bg2 border border-border">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text2 mb-3">
            Historique
          </h2>
          <div className="space-y-2 text-sm">
            <p className="text-text2">
              Commande passee le <DateDisplay date={order.createdAt} />
            </p>
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
          </div>
        </div>
      )}
    </div>
  );
}
