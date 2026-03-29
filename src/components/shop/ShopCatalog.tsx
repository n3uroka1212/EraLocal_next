"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "@/components/cards/ProductCard";
import { PillGroup } from "@/components/ui/PillGroup";

interface CatalogProduct {
  id: number;
  name: string;
  price: number | null;
  priceUnit: string | null;
  category: string | null;
  image: string | null;
}

interface ShopCatalogProps {
  products: CatalogProduct[];
  shopSlug: string;
}

export function ShopCatalog({ products, shopSlug }: ShopCatalogProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        category === "Tous" || p.category === category;
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, category, search]);

  return (
    <div>
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher un produit..."
        className="w-full bg-bg3 border-[1.5px] border-border rounded-button px-4 py-2.5 text-sm text-text placeholder:text-text3 outline-none mb-3 focus:border-terra"
      />
      {categories.length > 0 && (
        <PillGroup
          options={["Tous", ...categories]}
          value={category}
          onChange={setCategory}
          className="mb-4"
        />
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {filtered.map((p) => (
          <ProductCard key={p.id} shopSlug={shopSlug} {...p} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-sm text-text3 text-center py-8">
          Aucun produit trouve
        </p>
      )}
    </div>
  );
}
