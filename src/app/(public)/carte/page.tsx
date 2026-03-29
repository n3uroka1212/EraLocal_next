import { prisma } from "@/lib/db/client";
import { MapPageClient } from "@/components/maps/MapPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carte — EraLocal",
  description: "Trouvez les commerces, evenements et activites pres de vous sur la carte",
};

export default async function CartePage() {
  const shops = await prisma.shop.findMany({
    where: {
      verificationStatus: "verified",
      latitude: { not: null },
      longitude: { not: null },
    },
    select: {
      id: true,
      slug: true,
      name: true,
      businessType: true,
      logoEmoji: true,
      latitude: true,
      longitude: true,
    },
  });

  const markers = shops.map((s) => ({
    id: s.id,
    lat: s.latitude!,
    lng: s.longitude!,
    label: s.name,
    emoji: s.logoEmoji ?? (s.businessType === "commercant" ? "🏪" : "🎯"),
    href: `/boutiques/${s.slug}`,
    type: s.businessType,
  }));

  return <MapPageClient markers={markers} />;
}
