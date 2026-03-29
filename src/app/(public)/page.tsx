import { prisma } from "@/lib/db/client";
import { LandingClient } from "@/components/explore/LandingClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EraLocal — Decouvrez le commerce local",
  description:
    "Trouvez les boutiques, produits et evenements pres de chez vous. Commerce local, artisans, producteurs.",
};

export default async function HomePage() {
  const [shops, products] = await Promise.all([
    prisma.shop.findMany({
      where: { verificationStatus: "verified" },
      select: {
        slug: true,
        name: true,
        category: true,
        businessType: true,
        logoEmoji: true,
        banner: true,
      },
      take: 20,
      orderBy: { createdAt: "desc" },
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
        shop: { select: { slug: true } },
      },
      take: 20,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const formattedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    priceUnit: p.priceUnit,
    category: p.category,
    image: p.image,
    shopSlug: p.shop.slug,
  }));

  return <LandingClient shops={shops} products={formattedProducts} />;
}
