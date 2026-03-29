"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/providers/CartProvider";
import { createOrder } from "@/actions/checkout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { toast } from "@/components/ui/Toast";
import { OrderConfirmation } from "./OrderConfirmation";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

export function CheckoutClient() {
  const router = useRouter();
  const { items, shopId, shopName, total, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<{
    orderNumber: string;
    pickupTime?: string;
  } | null>(null);

  // Redirect to cart if empty (and not showing confirmation)
  useEffect(() => {
    if (items.length === 0 && !orderResult) {
      router.replace("/panier");
    }
  }, [items.length, orderResult, router]);

  if (orderResult) {
    return (
      <OrderConfirmation
        orderNumber={orderResult.orderNumber}
        pickupTime={orderResult.pickupTime}
      />
    );
  }

  if (items.length === 0) {
    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!shopId) return;

    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const pickupTimeValue = formData.get("pickupTime") as string;

    try {
      const result = await createOrder(
        shopId,
        items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          name: item.name,
          variantName: item.variantName,
          price: item.price,
          quantity: item.quantity,
        })),
        formData,
      );

      if (result.error) {
        setError(result.error);
        toast("error", result.error);
      } else if (result.success && result.orderNumber) {
        setOrderResult({
          orderNumber: result.orderNumber,
          pickupTime: pickupTimeValue || undefined,
        });
        clearCart();
        toast("success", "Commande confirmee !");
      }
    } catch {
      setError("Une erreur est survenue. Veuillez reessayer.");
      toast("error", "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-xl font-serif font-semibold text-text mb-1">
        Finaliser la commande
      </h1>
      {shopName && (
        <p className="text-sm text-text2 mb-6">{shopName}</p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Contact info */}
        <fieldset className="flex flex-col gap-4">
          <legend className="text-sm font-semibold text-text mb-2">
            Vos coordonnees
          </legend>
          <Input
            name="clientName"
            label="Nom complet"
            placeholder="Jean Dupont"
            required
            autoComplete="name"
          />
          <Input
            name="clientPhone"
            label="Telephone"
            type="tel"
            placeholder="06 12 34 56 78"
            required
            autoComplete="tel"
          />
          <Input
            name="clientEmail"
            label="Email (optionnel)"
            type="email"
            placeholder="jean@exemple.fr"
            autoComplete="email"
          />
        </fieldset>

        {/* Pickup */}
        <fieldset className="flex flex-col gap-4">
          <legend className="text-sm font-semibold text-text mb-2">
            Retrait
          </legend>
          <Input
            name="pickupTime"
            label="Creneau de retrait"
            type="datetime-local"
            required
            min={new Date().toISOString().slice(0, 16)}
          />
          <Textarea
            name="notes"
            label="Notes (optionnel)"
            placeholder="Instructions particulieres, allergies..."
            rows={3}
            maxLength={500}
          />
        </fieldset>

        {/* Order summary */}
        <div className="bg-bg2 border border-border rounded-card p-4">
          <h2 className="text-sm font-semibold text-text mb-3">
            Recapitulatif
          </h2>
          <ul className="flex flex-col gap-2">
            {items.map((item) => {
              const key = `${item.productId}-${item.variantId ?? "default"}`;
              return (
                <li key={key} className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-bg3 shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text3 text-xs">
                        📦
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text truncate">
                      {item.name}
                      {item.variantName && (
                        <span className="text-text2">
                          {" "}
                          &middot; {item.variantName}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-text2">
                      {item.quantity} &times; {formatPrice(item.price)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-text shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-border mt-3 pt-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-text2">Total</span>
            <span className="text-lg font-serif font-semibold text-text">
              {formatPrice(total)}
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-light border border-red/20 rounded-card px-4 py-3 text-sm text-red">
            {error}
          </div>
        )}

        {/* Submit */}
        <Button type="submit" variant="primary" size="lg" loading={loading}>
          Confirmer la commande
        </Button>
      </form>
    </div>
  );
}
