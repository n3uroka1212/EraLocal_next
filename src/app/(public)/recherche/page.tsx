import type { Metadata } from "next";
import { SearchPageClient } from "@/components/search/SearchPageClient";
import { prisma } from "@/lib/db/client";

export const metadata: Metadata = {
  title: "Recherche — EraLocal",
  description: "Rechercher des boutiques et produits locaux",
};

export default async function RecherchePage() {
  const [shops, products] = await Promise.all([
    prisma.shop.findMany({
      where: { verificationStatus: "verified" },
      select: {
        id: true,
        slug: true,
        name: true,
        category: true,
        businessType: true,
        logoEmoji: true,
        banner: true,
        latitude: true,
        longitude: true,
        city: true,
      },
    }),
    prisma.catalogProduct.findMany({
      where: {
        available: true,
        shop: { verificationStatus: "verified" },
      },
      select: {
        id: true,
        name: true,
        price: true,
        priceUnit: true,
        category: true,
        image: true,
        shop: { select: { slug: true, name: true } },
      },
    }),
  ]);

  return (
    <SearchPageClient
      shops={shops.map((s) => ({
        ...s,
        latitude: s.latitude ?? undefined,
        longitude: s.longitude ?? undefined,
      }))}
      products={products.map((p) => ({
        ...p,
        shopSlug: p.shop.slug,
        shopName: p.shop.name,
      }))}
    />
  );
}
