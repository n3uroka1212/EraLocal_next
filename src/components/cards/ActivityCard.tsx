"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

interface ActivityCardProps {
  id: number;
  name: string;
  category?: string | null;
  mainImage?: string | null;
  priceInfo?: string | null;
  shopName: string;
}

export function ActivityCard({
  id,
  name,
  category,
  mainImage,
  priceInfo,
  shopName,
}: ActivityCardProps) {
  return (
    <Link
      href={`/activites/${id}`}
      className="bg-white rounded-card border-[1.5px] border-border overflow-hidden hover:shadow-md transition-all duration-200 animate-[cardFadeIn_0.3s_ease]"
    >
      <div className="relative h-36">
        {mainImage ? (
          <img
            src={mainImage}
            alt={name}
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
          {name}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          {category && <Badge variant="purple">{category}</Badge>}
          {priceInfo && (
            <span className="text-[0.75rem] text-text2">{priceInfo}</span>
          )}
        </div>
        <p className="text-[0.75rem] text-text3 mt-1">🏪 {shopName}</p>
      </div>
    </Link>
  );
}
