"use client";

import Link from "next/link";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import type { CatalogProductItem } from "./CatalogPageClient";

interface CatalogProductCardProps {
  product: CatalogProductItem;
  onToggleVisibility: () => void;
  onDelete: () => void;
  onSplit?: () => void;
  onMerge?: () => void;
  isPending: boolean;
}

export function CatalogProductCard({
  product,
  onToggleVisibility,
  onDelete,
  onSplit,
  onMerge,
  isPending,
}: CatalogProductCardProps) {
  return (
    <div className="flex items-center gap-4 bg-bg2 border border-border rounded-card p-4 hover:border-terra/50 transition-colors cursor-grab active:cursor-grabbing">
      {/* Drag handle */}
      <span className="text-text3 text-lg select-none" aria-hidden>
        ⠿
      </span>

      {/* Image */}
      <div className="w-14 h-14 rounded-button overflow-hidden bg-bg3 flex-shrink-0">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text3 text-xl">
            📦
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/catalogue/${product.id}`}
          className="text-sm font-semibold text-text hover:text-terra transition-colors line-clamp-1"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-2 mt-1">
          {product.price != null && (
            <span className="text-sm text-terra font-medium">
              {product.price.toFixed(2)} &euro;
              {product.priceUnit ? `/${product.priceUnit}` : ""}
            </span>
          )}
          {product.category && (
            <Badge variant="default">{product.category}</Badge>
          )}
          {product.variants.length > 0 && (
            <Badge variant="cyan">
              {product.variants.length} variante(s)
            </Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Toggle
          checked={product.available}
          onChange={onToggleVisibility}
          disabled={isPending}
        />
        {onSplit && (
          <button
            onClick={onSplit}
            disabled={isPending}
            className="text-xs text-text2 hover:text-terra transition-colors px-2 py-1"
            title="Separer les variantes"
          >
            Split
          </button>
        )}
        {onMerge && (
          <button
            onClick={onMerge}
            disabled={isPending}
            className="text-xs text-text2 hover:text-terra transition-colors px-2 py-1"
            title="Fusionner"
          >
            Merge
          </button>
        )}
        <button
          onClick={onDelete}
          disabled={isPending}
          className="text-xs text-text3 hover:text-red transition-colors px-2 py-1"
          title="Supprimer"
        >
          &#x2715;
        </button>
      </div>
    </div>
  );
}
