"use client";

import Link from "next/link";
import Image from "next/image";

interface ShopCardProps {
  slug: string;
  name: string;
  category?: string | null;
  businessType: string;
  logoEmoji?: string | null;
  banner?: string | null;
  distance?: number | null;
}

const typeLabels: Record<string, { label: string; emoji: string }> = {
  commercant: { label: "Commercant", emoji: "🏪" },
  producteur: { label: "Producteur", emoji: "🌾" },
  artisan: { label: "Artisan", emoji: "🎨" },
  activite: { label: "Activite", emoji: "🎯" },
};

export function ShopCard({
  slug,
  name,
  category,
  businessType,
  logoEmoji,
  banner,
  distance,
}: ShopCardProps) {
  const type = typeLabels[businessType] ?? typeLabels.commercant;

  return (
    <Link
      href={`/boutiques/${slug}`}
      className="shrink-0 w-[260px] bg-white rounded-card border-[1.5px] border-border overflow-hidden transition-all duration-250 hover:shadow-lg hover:-translate-y-0.5 animate-[cardFadeIn_0.3s_ease]"
    >
      <div className="relative h-[110px]">
        {banner ? (
          <Image
            src={banner}
            alt={name}
            fill
            sizes="260px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-terra-light to-bg3" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-pill text-[0.65rem] font-semibold bg-white/80 backdrop-blur-sm text-text">
          {type.emoji} {type.label}
        </span>
        {distance != null && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-input text-[0.65rem] font-medium bg-black/50 text-white">
            📍 {distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`}
          </span>
        )}
      </div>
      <div className="relative px-3 pt-6 pb-3">
        <div className="absolute -top-5 left-3 w-9 h-9 flex items-center justify-center rounded-full bg-terra-light border-2 border-white text-base shadow">
          {logoEmoji || type.emoji}
        </div>
        <h3 className="font-serif font-semibold text-[1.05rem] leading-tight text-text truncate">
          {name}
        </h3>
        {category && (
          <p className="text-[0.75rem] text-text2 mt-0.5 truncate">
            {category}
          </p>
        )}
      </div>
    </Link>
  );
}
