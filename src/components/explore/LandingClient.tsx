"use client";

import { useState, useCallback } from "react";
import { SearchBar } from "@/components/search/SearchBar";
import { TypeFilters } from "@/components/filters/TypeFilters";
import { ShopCard } from "@/components/cards/ShopCard";
import { ProductCard } from "@/components/cards/ProductCard";
import Link from "next/link";

interface ShopData {
  slug: string;
  name: string;
  category: string | null;
  businessType: string;
  logoEmoji: string | null;
  banner: string | null;
}

interface ProductData {
  id: number;
  name: string;
  price: number | null;
  priceUnit: string | null;
  category: string | null;
  image: string | null;
  shopSlug: string;
}

interface LandingClientProps {
  shops: ShopData[];
  products: ProductData[];
}

export function LandingClient({ shops, products }: LandingClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("Tous");

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const typeMap: Record<string, string> = {
    Commercant: "commercant",
    Producteur: "producteur",
    Artisan: "artisan",
  };

  const filteredShops = shops.filter((shop) => {
    const matchesType =
      typeFilter === "Tous" || shop.businessType === typeMap[typeFilter];
    const matchesSearch =
      !searchQuery ||
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="px-4 md:px-6 py-6">
      <SearchBar onSearch={handleSearch} className="mb-4" />
      <TypeFilters value={typeFilter} onChange={setTypeFilter} className="mb-6" />

      {/* Boutiques */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif font-semibold text-[1.15rem] text-text">
            Pres de chez vous
          </h2>
          <span className="text-xs text-text3">
            {filteredShops.length} boutique{filteredShops.length > 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {filteredShops.length > 0 ? (
            filteredShops.map((shop) => (
              <ShopCard key={shop.slug} {...shop} />
            ))
          ) : (
            <p className="text-sm text-text3 py-8 text-center w-full">
              Aucune boutique trouvee
            </p>
          )}
        </div>
      </section>

      {/* Produits populaires */}
      {!searchQuery && (
        <section className="mb-8">
          <h2 className="font-serif font-semibold text-[1.15rem] text-text mb-3">
            Produits populaires
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </section>
      )}

      {/* Voir sur la carte */}
      <Link
        href="/carte"
        className="sticky bottom-20 md:bottom-4 flex items-center justify-center gap-2 w-full py-3.5 bg-terra text-white rounded-button font-semibold text-sm shadow-lg hover:bg-accent-hover transition-all duration-200"
      >
        🗺️ Voir sur la carte
      </Link>
    </div>
  );
}
