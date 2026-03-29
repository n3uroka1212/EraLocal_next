"use client";

import { useEffect } from "react";

interface PingResponsePopupProps {
  open: boolean;
  onClose: () => void;
  response: "en_stock" | "rupture";
  productName: string;
}

export function PingResponsePopup({
  open,
  onClose,
  response,
  productName,
}: PingResponsePopupProps) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  const isInStock = response === "en_stock";

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isInStock ? "Produit en stock" : "Produit en rupture"}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-sm rounded-modal p-8 text-center shadow-lg animate-[scaleIn_0.3s_ease] ${
          isInStock
            ? "bg-green-light border-2 border-green/30"
            : "bg-red-light border-2 border-red/30"
        }`}
      >
        {/* Icon */}
        <div
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl font-bold text-white ${
            isInStock ? "bg-green" : "bg-red"
          }`}
        >
          {isInStock ? "\u2713" : "\u2715"}
        </div>

        {/* Message */}
        <h2
          className={`text-xl font-bold mb-2 ${
            isInStock ? "text-green" : "text-red"
          }`}
        >
          {isInStock ? "Ce produit est en stock !" : "Ce produit est en rupture."}
        </h2>
        <p className="text-sm text-text2 mb-6">{productName}</p>

        {/* Close button */}
        <button
          onClick={onClose}
          className={`px-6 py-2.5 rounded-button font-semibold text-sm text-white transition-opacity hover:opacity-90 ${
            isInStock ? "bg-green" : "bg-red"
          }`}
        >
          Fermer
        </button>

        {/* Auto-dismiss indicator */}
        <div className="mt-4 mx-auto h-1 w-24 rounded-full bg-black/10 overflow-hidden">
          <div
            className={`h-full rounded-full ${isInStock ? "bg-green" : "bg-red"} animate-[shrink_5s_linear_forwards]`}
          />
        </div>
      </div>
    </div>
  );
}
