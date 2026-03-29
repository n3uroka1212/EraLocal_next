"use client";

import { useState } from "react";
import { useCart } from "@/providers/CartProvider";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";

interface AddToCartButtonProps {
  productId: number;
  variantId?: number;
  variantName?: string;
  available: boolean;
  clickCollectEnabled: boolean;
  shopId: number;
  shopName: string;
  productName: string;
  price: number;
  image?: string | null;
}

export function AddToCartButton({
  productId,
  variantId,
  variantName,
  available,
  clickCollectEnabled,
  shopId,
  shopName,
  productName,
  price,
  image,
}: AddToCartButtonProps) {
  const { addItem, wouldSwitchShop, confirmSwitchShop } = useCart();
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);

  if (!clickCollectEnabled) return null;

  function handleAdd() {
    if (wouldSwitchShop(shopId)) {
      setShowSwitchDialog(true);
      return;
    }

    const success = addItem(shopId, shopName, {
      productId,
      variantId,
      variantName,
      name: productName,
      price,
      image,
    });

    if (success) {
      toast("success", `${productName} ajoute au panier`);
    }
  }

  function handleConfirmSwitch() {
    confirmSwitchShop(shopId, shopName);
    addItem(shopId, shopName, {
      productId,
      variantId,
      variantName,
      name: productName,
      price,
      image,
    });
    setShowSwitchDialog(false);
    toast("success", `${productName} ajoute au panier`);
  }

  return (
    <>
      <Button
        variant="primary"
        size="lg"
        disabled={!available}
        onClick={handleAdd}
      >
        {available ? "Ajouter au panier" : "Produit indisponible"}
      </Button>

      <ConfirmDialog
        open={showSwitchDialog}
        onClose={() => setShowSwitchDialog(false)}
        onConfirm={handleConfirmSwitch}
        title="Changer de boutique ?"
        message="Votre panier contient des produits d'une autre boutique. En continuant, votre panier actuel sera vide et remplace."
        confirmLabel="Vider et ajouter"
        cancelLabel="Annuler"
        variant="danger"
      />
    </>
  );
}
