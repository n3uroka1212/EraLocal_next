"use client";

import { useState } from "react";
import { VitrineHero } from "./VitrineHero";
import { VitrineInfoStrip } from "./VitrineInfoStrip";
import { VitrineProducts } from "./VitrineProducts";
import { CategoryManager } from "./CategoryManager";

interface VitrineShop {
  name: string;
  description: string | null;
  category: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  phone: string | null;
  email: string;
  website: string | null;
  openingHours: Record<string, unknown> | null;
  logo: string | null;
  logoEmoji: string | null;
  banner: string | null;
}

interface VitrineProduct {
  id: number;
  name: string;
  price: number | null;
  priceUnit: string | null;
  category: string | null;
  image: string | null;
  variants: { id: number; name: string; price: number | null }[];
}

interface VitrinePreviewProps {
  shop: VitrineShop;
  products: VitrineProduct[];
  categories: string[];
}

export function VitrinePreview({
  shop,
  products,
  categories,
}: VitrinePreviewProps) {
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [featuredCategories, setFeaturedCategories] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const filteredProducts = filterCategory
    ? products.filter((p) => p.category === filterCategory)
    : products;

  const featuredProducts = products.filter(
    (p) => p.category && featuredCategories.includes(p.category),
  );

  return (
    <div className="bg-bg2 rounded-card border border-border overflow-hidden">
      <VitrineHero
        name={shop.name}
        banner={shop.banner}
        logo={shop.logo}
        logoEmoji={shop.logoEmoji}
      />

      <div className="p-4 space-y-6">
        {shop.description && (
          <p className="text-sm text-text2">{shop.description}</p>
        )}

        <VitrineInfoStrip
          address={shop.address}
          postalCode={shop.postalCode}
          city={shop.city}
          phone={shop.phone}
          email={shop.email}
          website={shop.website}
          openingHours={shop.openingHours}
        />

        {/* Featured products */}
        {featuredProducts.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-text mb-3">
              Mis en avant
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {featuredProducts.map((p) => (
                <FeaturedProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Category filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory(null)}
            className={`text-xs px-3 py-1.5 rounded-pill transition-colors ${
              filterCategory === null
                ? "bg-terra text-white"
                : "bg-bg3 text-text2 hover:bg-bg4"
            }`}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setFilterCategory(filterCategory === cat ? null : cat)
              }
              className={`text-xs px-3 py-1.5 rounded-pill transition-colors ${
                filterCategory === cat
                  ? "bg-terra text-white"
                  : "bg-bg3 text-text2 hover:bg-bg4"
              }`}
            >
              {cat}
              {featuredCategories.includes(cat) && " ★"}
            </button>
          ))}
          <button
            onClick={() => setShowCategoryManager(true)}
            className="text-xs px-3 py-1.5 rounded-pill bg-bg3 text-text3 hover:text-terra transition-colors"
          >
            Gerer
          </button>
        </div>

        <VitrineProducts products={filteredProducts} />
      </div>

      {showCategoryManager && (
        <CategoryManager
          categories={categories}
          featured={featuredCategories}
          onFeaturedChange={setFeaturedCategories}
          onClose={() => setShowCategoryManager(false)}
        />
      )}
    </div>
  );
}

function FeaturedProductCard({
  product,
}: {
  product: VitrineProduct;
}) {
  return (
    <div className="flex-shrink-0 w-36 border-2 border-[goldenrod] bg-[rgba(255,215,0,0.12)] rounded-button p-2.5">
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-24 object-cover rounded-small mb-2"
        />
      ) : (
        <div className="w-full h-24 bg-bg3 rounded-small mb-2 flex items-center justify-center text-text3">
          📦
        </div>
      )}
      <p className="text-xs font-medium text-text line-clamp-1">
        {product.name}
      </p>
      {product.price != null && (
        <p className="text-xs text-terra font-medium">
          {product.price.toFixed(2)} &euro;
        </p>
      )}
    </div>
  );
}
