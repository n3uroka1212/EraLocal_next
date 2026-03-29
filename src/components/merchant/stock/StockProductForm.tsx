"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import { createStockProduct, updateStockProduct } from "@/actions/stock";

type StockProduct = {
  id: number;
  name: string;
  quantity: number;
  unit: string | null;
  price: number | null;
  category: string | null;
  minStock: number | null;
  expiryDate: string | null;
  barcode: string | null;
  supplier: string | null;
  description: string | null;
};

interface StockProductFormProps {
  product: StockProduct | null;
  onClose: () => void;
}

const UNIT_OPTIONS = [
  { value: "", label: "Aucune" },
  { value: "unite", label: "Unite" },
  { value: "kg", label: "Kilogramme (kg)" },
  { value: "g", label: "Gramme (g)" },
  { value: "L", label: "Litre (L)" },
  { value: "mL", label: "Millilitre (mL)" },
  { value: "piece", label: "Piece" },
  { value: "lot", label: "Lot" },
  { value: "carton", label: "Carton" },
  { value: "bouteille", label: "Bouteille" },
  { value: "sachet", label: "Sachet" },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "Aucune" },
  { value: "alimentaire", label: "Alimentaire" },
  { value: "boissons", label: "Boissons" },
  { value: "frais", label: "Produits frais" },
  { value: "surgele", label: "Surgeles" },
  { value: "epicerie", label: "Epicerie" },
  { value: "boulangerie", label: "Boulangerie" },
  { value: "fruits-legumes", label: "Fruits & Legumes" },
  { value: "viande", label: "Viande" },
  { value: "poisson", label: "Poisson" },
  { value: "cremerie", label: "Cremerie" },
  { value: "hygiene", label: "Hygiene" },
  { value: "entretien", label: "Entretien" },
  { value: "autre", label: "Autre" },
];

function formatDateForInput(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

export function StockProductForm({ product, onClose }: StockProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = product !== null;

  function buildFormData(form: HTMLFormElement): FormData {
    return new FormData(form);
  }

  function validate(formData: FormData): boolean {
    const newErrors: Record<string, string> = {};
    const name = formData.get("name") as string;
    if (!name || name.trim().length === 0) {
      newErrors.name = "Le nom est requis";
    }
    const quantity = Number(formData.get("quantity"));
    if (isNaN(quantity) || quantity < 0) {
      newErrors.quantity = "La quantite doit etre positive";
    }
    const price = formData.get("price") as string;
    if (price && (isNaN(Number(price)) || Number(price) < 0)) {
      newErrors.price = "Le prix doit etre positif";
    }
    const minStock = formData.get("minStock") as string;
    if (minStock && (isNaN(Number(minStock)) || Number(minStock) < 0)) {
      newErrors.minStock = "Le stock minimum doit etre positif";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = buildFormData(form);

    if (!validate(formData)) return;

    startTransition(async () => {
      const result = isEditing
        ? await updateStockProduct(product.id, null, formData)
        : await createStockProduct(null, formData);

      if (result.error) {
        toast("error", result.error);
        return;
      }

      toast("success", isEditing ? "Produit mis a jour" : "Produit cree");
      onClose();
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nom du produit"
        name="name"
        defaultValue={product?.name ?? ""}
        error={errors.name}
        required
        placeholder="Ex: Tomates bio"
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Quantite"
          name="quantity"
          type="number"
          step="0.01"
          min="0"
          defaultValue={product?.quantity ?? 0}
          error={errors.quantity}
        />
        <Select
          label="Unite"
          name="unit"
          options={UNIT_OPTIONS}
          defaultValue={product?.unit ?? ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Prix unitaire"
          name="price"
          type="number"
          step="0.01"
          min="0"
          defaultValue={product?.price ?? ""}
          error={errors.price}
          placeholder="0.00"
        />
        <Select
          label="Categorie"
          name="category"
          options={CATEGORY_OPTIONS}
          defaultValue={product?.category ?? ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Stock minimum (alerte)"
          name="minStock"
          type="number"
          min="0"
          defaultValue={product?.minStock ?? ""}
          error={errors.minStock}
          placeholder="Ex: 5"
        />
        <Input
          label="Date d'expiration"
          name="expiryDate"
          type="date"
          defaultValue={formatDateForInput(product?.expiryDate ?? null)}
        />
      </div>

      <Input
        label="Code-barres"
        name="barcode"
        defaultValue={product?.barcode ?? ""}
        placeholder="Ex: 3760001..."
      />

      <Input
        label="Fournisseur"
        name="supplier"
        defaultValue={product?.supplier ?? ""}
        placeholder="Ex: Metro, Rungis..."
      />

      <Textarea
        label="Description"
        name="description"
        defaultValue={product?.description ?? ""}
        placeholder="Notes internes sur ce produit..."
        rows={3}
      />

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" loading={isPending}>
          {isEditing ? "Mettre a jour" : "Creer"}
        </Button>
      </div>
    </form>
  );
}
