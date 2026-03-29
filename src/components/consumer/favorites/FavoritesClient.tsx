"use client";

import { useState } from "react";
import Link from "next/link";
import { useFavorites } from "@/providers/FavoritesProvider";
import { Pill } from "@/components/ui/Pill";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { CalendarDateBox } from "@/components/ui/CalendarDateBox";

// --- Types ---

interface FavShop {
  id: number;
  name: string;
  slug: string;
  category: string | null;
  businessType: string;
  logoEmoji: string | null;
  banner: string | null;
}

interface FavProduct {
  id: number;
  name: string;
  price: number | null;
  priceUnit: string | null;
  category: string | null;
  image: string | null;
  shopSlug: string;
}

interface FavEvent {
  id: number;
  title: string;
  eventType: string | null;
  eventDate: string | null;
  eventTime: string | null;
  isRecurring: boolean;
  shopName: string;
}

interface FavActivity {
  id: number;
  name: string;
  category: string | null;
  mainImage: string | null;
  priceInfo: string | null;
  shopName: string;
}

interface FavoritesClientProps {
  shops: FavShop[];
  products: FavProduct[];
  events: FavEvent[];
  activities: FavActivity[];
}

type TabKey = "shops" | "products" | "events" | "activities";

const TABS: { label: string; value: TabKey }[] = [
  { label: "Boutiques", value: "shops" },
  { label: "Produits", value: "products" },
  { label: "Evenements", value: "events" },
  { label: "Activites", value: "activities" },
];

const typeLabels: Record<string, { label: string; emoji: string }> = {
  commercant: { label: "Commercant", emoji: "🏪" },
  producteur: { label: "Producteur", emoji: "🌾" },
  artisan: { label: "Artisan", emoji: "🎨" },
  activite: { label: "Activite", emoji: "🎯" },
};

export function FavoritesClient({
  shops,
  products,
  events,
  activities,
}: FavoritesClientProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("shops");
  const { isFavorite, toggleFavorite, getFavoritesByType } = useFavorites();

  // Use context to determine which items are still favorited (handles optimistic removal)
  const favShops = shops.filter((s) => isFavorite("shop", s.id));
  const favProducts = products.filter((p) => isFavorite("product", p.id));
  const favEvents = events.filter((e) => isFavorite("event", e.id));
  const favActivities = activities.filter((a) => isFavorite("activity", a.id));

  const counts: Record<TabKey, number> = {
    shops: favShops.length,
    products: favProducts.length,
    events: favEvents.length,
    activities: favActivities.length,
  };

  function handleRemove(
    type: "shop" | "product" | "event" | "activity",
    itemId: number,
  ) {
    toggleFavorite(type, itemId);
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold font-serif text-text">Mes favoris</h1>

      {/* Tab pills with counts */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {TABS.map((tab) => (
          <Pill
            key={tab.value}
            label={`${tab.label} (${counts[tab.value]})`}
            active={activeTab === tab.value}
            onClick={() => setActiveTab(tab.value)}
          />
        ))}
      </div>

      {/* Shops tab */}
      {activeTab === "shops" && (
        <>
          {favShops.length === 0 ? (
            <EmptyState
              icon="🏪"
              title="Aucune boutique en favori"
              description="Explorez les boutiques et ajoutez vos preferees en favori."
              action={
                <Link
                  href="/"
                  className="text-sm font-semibold text-terra hover:underline"
                >
                  Explorer
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {favShops.map((shop) => {
                const type =
                  typeLabels[shop.businessType] ?? typeLabels.commercant;
                return (
                  <div
                    key={shop.id}
                    className="relative bg-white rounded-card border-[1.5px] border-border overflow-hidden transition-all duration-200 hover:shadow-md"
                  >
                    <Link href={`/boutiques/${shop.slug}`}>
                      <div className="relative h-24">
                        {shop.banner ? (
                          <img
                            src={shop.banner}
                            alt={shop.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-terra-light to-bg3" />
                        )}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-pill text-[0.65rem] font-semibold bg-white/80 backdrop-blur-sm text-text">
                          {type.emoji} {type.label}
                        </span>
                      </div>
                      <div className="relative px-3 pt-6 pb-3">
                        <div className="absolute -top-5 left-3 w-9 h-9 flex items-center justify-center rounded-full bg-terra-light border-2 border-white text-base shadow">
                          {shop.logoEmoji || type.emoji}
                        </div>
                        <h3 className="font-serif font-semibold text-[1.05rem] leading-tight text-text truncate">
                          {shop.name}
                        </h3>
                        {shop.category && (
                          <p className="text-[0.75rem] text-text2 mt-0.5 truncate">
                            {shop.category}
                          </p>
                        )}
                      </div>
                    </Link>
                    <button
                      onClick={() => handleRemove("shop", shop.id)}
                      className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors hover:scale-110 active:scale-90"
                      aria-label="Retirer des favoris"
                    >
                      ⭐
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Products tab */}
      {activeTab === "products" && (
        <>
          {favProducts.length === 0 ? (
            <EmptyState
              icon="📦"
              title="Aucun produit en favori"
              description="Parcourez les catalogues et ajoutez des produits en favori."
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {favProducts.map((product) => (
                <div
                  key={product.id}
                  className="relative bg-white rounded-card border-[1.5px] border-border overflow-hidden transition-all duration-200 hover:shadow-md"
                >
                  <Link
                    href={`/boutiques/${product.shopSlug}/produits/${product.id}`}
                  >
                    <div className="relative aspect-square">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-terra-light to-bg3 flex items-center justify-center">
                          <span className="text-3xl text-text3">📦</span>
                        </div>
                      )}
                    </div>
                    <div className="p-2.5 pb-3">
                      <h3 className="font-medium text-sm text-text truncate">
                        {product.name}
                      </h3>
                      {product.category && (
                        <p className="text-[0.7rem] text-text3 truncate mt-0.5">
                          {product.category}
                        </p>
                      )}
                      {product.price != null && (
                        <div className="mt-1">
                          <PriceDisplay
                            price={product.price}
                            unit={product.priceUnit ?? undefined}
                          />
                        </div>
                      )}
                    </div>
                  </Link>
                  <button
                    onClick={() => handleRemove("product", product.id)}
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors hover:scale-110 active:scale-90"
                    aria-label="Retirer des favoris"
                  >
                    ⭐
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Events tab */}
      {activeTab === "events" && (
        <>
          {favEvents.length === 0 ? (
            <EmptyState
              icon="📅"
              title="Aucun evenement en favori"
              description="Decouvrez les evenements locaux et enregistrez ceux qui vous interessent."
              action={
                <Link
                  href="/evenements"
                  className="text-sm font-semibold text-terra hover:underline"
                >
                  Voir les evenements
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {favEvents.map((event) => (
                <div
                  key={event.id}
                  className="relative flex gap-3 p-3 bg-white rounded-card border-[1.5px] border-border hover:shadow-md transition-all duration-200"
                >
                  <Link
                    href={`/evenements/${event.id}`}
                    className="flex gap-3 flex-1 min-w-0"
                  >
                    {event.eventDate && (
                      <CalendarDateBox date={event.eventDate} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {event.eventType && (
                          <Badge variant="terra">{event.eventType}</Badge>
                        )}
                        {event.isRecurring && (
                          <Badge variant="green">Recurrent</Badge>
                        )}
                      </div>
                      <h3 className="font-serif font-semibold text-[1.05rem] text-text truncate">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-[0.75rem] text-text2">
                        {event.eventTime && <span>🕐 {event.eventTime}</span>}
                        <span>🏪 {event.shopName}</span>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleRemove("event", event.id)}
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors hover:scale-110 active:scale-90"
                    aria-label="Retirer des favoris"
                  >
                    ⭐
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Activities tab */}
      {activeTab === "activities" && (
        <>
          {favActivities.length === 0 ? (
            <EmptyState
              icon="🎯"
              title="Aucune activite en favori"
              description="Decouvrez les activites locales et ajoutez vos preferees."
              action={
                <Link
                  href="/activites"
                  className="text-sm font-semibold text-terra hover:underline"
                >
                  Voir les activites
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {favActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="relative bg-white rounded-card border-[1.5px] border-border overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  <Link href={`/activites/${activity.id}`}>
                    <div className="relative h-36">
                      {activity.mainImage ? (
                        <img
                          src={activity.mainImage}
                          alt={activity.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple/20 to-bg3 flex items-center justify-center">
                          <span className="text-3xl">🎯</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-serif font-semibold text-[1.05rem] text-text truncate">
                        {activity.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {activity.category && (
                          <Badge variant="purple">{activity.category}</Badge>
                        )}
                        {activity.priceInfo && (
                          <span className="text-[0.75rem] text-text2">
                            {activity.priceInfo}
                          </span>
                        )}
                      </div>
                      <p className="text-[0.75rem] text-text3 mt-1">
                        🏪 {activity.shopName}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleRemove("activity", activity.id)}
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors hover:scale-110 active:scale-90"
                    aria-label="Retirer des favoris"
                  >
                    ⭐
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
