"use client";

import { useState, useCallback, useMemo } from "react";
import { SearchBar } from "./SearchBar";
import { TypeFilters } from "@/components/filters/TypeFilters";
import { ShopCard } from "@/components/cards/ShopCard";
import { ProductCard } from "@/components/cards/ProductCard";
import { scoreMatch } from "@/lib/search/scoring";
import { EmptyState } from "@/components/ui/EmptyState";

interface ShopItem {
  id: number;
  slug: string;
  name: string;
  category: string | null;
  businessType: string;
  logoEmoji: string | null;
  banner: string | null;
  latitude?: number;
  longitude?: number;
  city: string | null;
}

interface ProductItem {
  id: number;
  name: string;
  price: number | null;
  priceUnit: string | null;
  category: string | null;
  image: string | null;
  shopSlug: string;
  shopName: string;
}

interface SearchPageClientProps {
  shops: ShopItem[];
  products: ProductItem[];
}

const MAX_RESULTS = 50;

export function SearchPageClient({
  shops,
  products,
}: SearchPageClientProps) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("Tous");

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
  }, []);

  const sanitizedQuery = useMemo(() => {
    return query.slice(0, 100).replace(/[<>"']/g, "");
  }, [query]);

  const typeMap: Record<string, string> = {
    Commercant: "commercant",
    Producteur: "producteur",
    Artisan: "artisan",
  };

  const results = useMemo(() => {
    if (!sanitizedQuery) return { shops: [] as ShopItem[], products: [] as ProductItem[] };

    const scoredShops = shops
      .map((s) => ({
        item: s,
        score: Math.max(
          scoreMatch(sanitizedQuery, s.name),
          scoreMatch(sanitizedQuery, s.category ?? ""),
        ),
      }))
      .filter(
        (s) =>
          s.score > 0 &&
          (typeFilter === "Tous" || s.item.businessType === typeMap[typeFilter]),
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS)
      .map((s) => s.item);

    const scoredProducts = products
      .map((p) => ({
        item: p,
        score: Math.max(
          scoreMatch(sanitizedQuery, p.name),
          scoreMatch(sanitizedQuery, p.category ?? ""),
          scoreMatch(sanitizedQuery, p.shopName),
        ),
      }))
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS)
      .map((p) => p.item);

    return { shops: scoredShops, products: scoredProducts };
  }, [sanitizedQuery, typeFilter, shops, products, typeMap]);

  const totalResults = results.shops.length + results.products.length;

  return (
    <div className="px-4 md:px-6 py-6">
      <SearchBar onSearch={handleSearch} className="mb-4" />
      <TypeFilters
        value={typeFilter}
        onChange={setTypeFilter}
        className="mb-6"
      />

      {sanitizedQuery && (
        <p className="text-sm text-text2 mb-4">
          {totalResults} resultat{totalResults > 1 ? "s" : ""} pour &quot;{sanitizedQuery}&quot;
        </p>
      )}

      {sanitizedQuery && totalResults === 0 && (
        <EmptyState
          icon="🔍"
          title="Aucun resultat"
          description="Essayez avec des termes differents"
        />
      )}

      {results.shops.length > 0 && (
        <section className="mb-8">
          <h2 className="font-serif font-semibold text-[1.15rem] text-text mb-3">
            Boutiques
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {results.shops.map((shop) => (
              <ShopCard key={shop.slug} {...shop} />
            ))}
          </div>
        </section>
      )}

      {results.products.length > 0 && (
        <section>
          <h2 className="font-serif font-semibold text-[1.15rem] text-text mb-3">
            Produits
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {results.products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
