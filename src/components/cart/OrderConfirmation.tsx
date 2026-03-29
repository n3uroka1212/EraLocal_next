"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface OrderConfirmationProps {
  orderNumber: string;
  pickupTime?: string;
}

export function OrderConfirmation({
  orderNumber,
  pickupTime,
}: OrderConfirmationProps) {
  const formattedPickup = pickupTime
    ? new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date(pickupTime))
    : null;

  return (
    <div className="flex flex-col items-center text-center px-4 py-12 max-w-md mx-auto">
      {/* Success icon */}
      <div className="w-20 h-20 rounded-full bg-green-light flex items-center justify-center mb-6">
        <svg
          className="w-10 h-10 text-green"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      {/* Order number */}
      <p className="text-3xl font-serif font-bold text-terra tracking-wide">
        {orderNumber}
      </p>

      <h2 className="text-lg font-semibold text-text mt-4">
        Votre commande a ete confirmee
      </h2>

      <p className="text-sm text-text2 mt-2 max-w-xs">
        Vous recevrez une notification lorsque votre commande sera prete a
        retirer.
      </p>

      {/* Pickup reminder */}
      {formattedPickup && (
        <div className="mt-6 bg-bg2 border border-border rounded-card px-4 py-3 w-full">
          <p className="text-xs text-text2 uppercase tracking-wide font-semibold">
            Retrait prevu
          </p>
          <p className="text-sm text-text font-medium mt-1">
            {formattedPickup}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full mt-8">
        <Link href="/commandes">
          <Button variant="primary" size="lg">
            Voir mes commandes
          </Button>
        </Link>
        <Link href="/">
          <Button variant="secondary" size="lg">
            Retour a l&apos;accueil
          </Button>
        </Link>
      </div>
    </div>
  );
}
