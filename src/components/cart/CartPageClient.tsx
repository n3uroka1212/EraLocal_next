"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/providers/CartProvider";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

export function CartPageClient() {
  const { items, shopName, total, clearCart, updateQuantity, removeItem } =
    useCart();

  if (items.length === 0) {
    return (
      <EmptyState
        icon="🛒"
        title="Votre panier est vide"
        description="Parcourez les boutiques locales pour decouvrir des produits artisanaux."
        action={
          <Link href="/">
            <Button variant="primary" size="md">
              Explorer les boutiques
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-serif font-semibold text-text">
            Mon panier
          </h1>
          {shopName && (
            <p className="text-sm text-text2 mt-0.5">{shopName}</p>
          )}
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-red hover:underline cursor-pointer"
        >
          Vider le panier
        </button>
      </div>

      {/* Items list */}
      <ul className="flex flex-col gap-3">
        {items.map((item) => {
          const key = `${item.productId}-${item.variantId ?? "default"}`;
          const lineTotal = item.price * item.quantity;

          return (
            <li
              key={key}
              className="flex gap-3 bg-bg2 rounded-card p-3 border border-border"
            >
              {/* Product image */}
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-bg3 shrink-0">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text3 text-lg">
                    📦
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text truncate">
                      {item.name}
                    </p>
                    {item.variantName && (
                      <p className="text-xs text-text2">{item.variantName}</p>
                    )}
                    <p className="text-xs text-text2 mt-0.5">
                      {formatPrice(item.price)} / unite
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="text-text3 hover:text-red text-lg leading-none cursor-pointer shrink-0"
                    aria-label={`Supprimer ${item.name}`}
                  >
                    &times;
                  </button>
                </div>

                {/* Quantity controls + line total */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.quantity - 1,
                          item.variantId,
                        )
                      }
                      className="w-7 h-7 rounded-full border border-border bg-bg3 flex items-center justify-center text-text hover:border-terra transition-colors cursor-pointer text-sm font-bold"
                      aria-label="Reduire la quantite"
                    >
                      &minus;
                    </button>
                    <span className="text-sm font-semibold text-text w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.quantity + 1,
                          item.variantId,
                        )
                      }
                      className="w-7 h-7 rounded-full border border-border bg-bg3 flex items-center justify-center text-text hover:border-terra transition-colors cursor-pointer text-sm font-bold"
                      aria-label="Augmenter la quantite"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm font-serif font-semibold text-text">
                    {formatPrice(lineTotal)}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Total + CTA */}
      <div className="border-t border-border pt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-text2">Total</span>
          <span className="text-lg font-serif font-semibold text-text">
            {formatPrice(total)}
          </span>
        </div>
        <Link href="/checkout">
          <Button variant="primary" size="lg">
            Passer commande
          </Button>
        </Link>
        <Link
          href="/"
          className="text-center text-xs text-text2 hover:text-terra transition-colors"
        >
          Continuer mes achats
        </Link>
      </div>
    </div>
  );
}
