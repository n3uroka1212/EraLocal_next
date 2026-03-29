"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CatalogProductCard } from "./CatalogProductCard";
import { ProductForm } from "./ProductForm";
import {
  deleteProduct,
  toggleProductVisibility,
  reorderProducts,
  splitVariants,
  mergeVariants,
} from "@/actions/catalog";

export interface CatalogVariantItem {
  id: number;
  name: string;
  price: number | null;
  available: boolean;
  sortOrder: number;
}

export interface CatalogProductItem {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  priceUnit: string | null;
  category: string | null;
  image: string | null;
  available: boolean;
  sortOrder: number;
  variantSourceName: string | null;
  variants: CatalogVariantItem[];
}

interface CatalogPageClientProps {
  products: CatalogProductItem[];
}

export function CatalogPageClient({ products }: CatalogPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);
  const [items, setItems] = useState(products);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  function handleToggleVisibility(productId: number) {
    startTransition(async () => {
      await toggleProductVisibility(productId);
      router.refresh();
    });
  }

  function handleDelete(productId: number) {
    if (!confirm("Supprimer ce produit ?")) return;
    startTransition(async () => {
      await deleteProduct(productId);
      router.refresh();
    });
  }

  function handleSplit(productId: number) {
    startTransition(async () => {
      await splitVariants(productId);
      router.refresh();
    });
  }

  function handleMerge(productId: number) {
    startTransition(async () => {
      await mergeVariants(productId);
      router.refresh();
    });
  }

  function handleDragStart(index: number) {
    setDraggedIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...items];
    const [dragged] = newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, dragged);
    setItems(newItems);
    setDraggedIndex(index);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
    const reordered = items.map((item, i) => ({
      id: item.id,
      sortOrder: i,
    }));
    startTransition(async () => {
      await reorderProducts(reordered);
    });
  }

  function handleProductCreated() {
    setShowAddForm(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text2">{items.length} produit(s)</p>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? "Annuler" : "+ Ajouter"}
        </Button>
      </div>

      {showAddForm && (
        <div className="bg-bg2 border border-border rounded-card p-4">
          <ProductForm onSuccess={handleProductCreated} />
        </div>
      )}

      <div className="space-y-3">
        {items.map((product, index) => (
          <div
            key={product.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`transition-opacity ${
              draggedIndex === index ? "opacity-50" : ""
            }`}
          >
            <CatalogProductCard
              product={product}
              onToggleVisibility={() => handleToggleVisibility(product.id)}
              onDelete={() => handleDelete(product.id)}
              onSplit={
                product.variants.length > 0
                  ? () => handleSplit(product.id)
                  : undefined
              }
              onMerge={
                product.variantSourceName
                  ? () => handleMerge(product.id)
                  : undefined
              }
              isPending={isPending}
            />
          </div>
        ))}
      </div>

      {items.length === 0 && !showAddForm && (
        <div className="text-center py-12">
          <p className="text-text3 text-lg mb-2">Aucun produit</p>
          <p className="text-text3 text-sm">
            Ajoutez votre premier produit au catalogue
          </p>
        </div>
      )}
    </div>
  );
}
