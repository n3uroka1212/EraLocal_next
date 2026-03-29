"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createVariant, updateVariant, deleteVariant } from "@/actions/catalog";

interface Variant {
  id: number;
  name: string;
  price: number | null;
  available: boolean;
  sortOrder: number;
}

interface VariantsEditorProps {
  productId: number;
  variants: Variant[];
}

export function VariantsEditor({ productId, variants }: VariantsEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");

  function handleAdd() {
    if (!newName.trim()) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", newName);
      if (newPrice) formData.set("price", newPrice);
      formData.set("available", "true");
      await createVariant(productId, null, formData);
      setNewName("");
      setNewPrice("");
      setShowAdd(false);
      router.refresh();
    });
  }

  function handleDelete(variantId: number) {
    startTransition(async () => {
      await deleteVariant(variantId);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.5px] text-text2">
          Variantes ({variants.length})
        </p>
        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="text-xs text-terra hover:text-accent-hover transition-colors"
        >
          {showAdd ? "Annuler" : "+ Ajouter"}
        </button>
      </div>

      {variants.map((v) => (
        <div
          key={v.id}
          className="flex items-center gap-3 bg-bg3 rounded-input px-3 py-2"
        >
          <span className="text-sm text-text flex-1">{v.name}</span>
          {v.price != null && (
            <span className="text-sm text-terra">{v.price.toFixed(2)} &euro;</span>
          )}
          <button
            onClick={() => handleDelete(v.id)}
            disabled={isPending}
            className="text-xs text-text3 hover:text-red transition-colors"
            aria-label="Supprimer variante"
          >
            &#x2715;
          </button>
        </div>
      ))}

      {showAdd && (
        <div className="flex items-end gap-2">
          <Input
            label="Nom"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ex: 250g, Rouge..."
          />
          <Input
            label="Prix"
            type="number"
            step="0.01"
            min="0"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            placeholder="0.00"
          />
          <Button size="sm" loading={isPending} onClick={handleAdd}>
            OK
          </Button>
        </div>
      )}
    </div>
  );
}
