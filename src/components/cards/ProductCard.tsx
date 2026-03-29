"use client";

import Link from "next/link";
import Image from "next/image";
import { PriceDisplay } from "@/components/ui/PriceDisplay";

interface ProductCardProps {
  id: number;
  shopSlug: string;
  name: string;
  price?: number | null;
  priceUnit?: string | null;
  category?: string | null;
  image?: string | null;
}

export function ProductCard({
  id,
  shopSlug,
  name,
  price,
  priceUnit,
  category,
  image,
}: ProductCardProps) {
  return (
    <Link
      href={`/boutiques/${shopSlug}/produits/${id}`}
      className="bg-white rounded-card border-[1.5px] border-border overflow-hidden transition-all duration-250 hover:shadow-lg hover:-translate-y-0.5 animate-[cardFadeIn_0.3s_ease]"
    >
      <div className="relative aspect-square">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, 200px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-terra-light to-bg3 flex items-center justify-center">
            <span className="text-3xl text-text3">📦</span>
          </div>
        )}
      </div>
      <div className="p-2.5 pb-3">
        <h3 className="font-medium text-sm text-text truncate">{name}</h3>
        {category && (
          <p className="text-[0.7rem] text-text3 truncate mt-0.5">
            {category}
          </p>
        )}
        {price != null && (
          <div className="mt-1">
            <PriceDisplay price={price} unit={priceUnit ?? undefined} />
          </div>
        )}
      </div>
    </Link>
  );
}
