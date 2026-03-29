import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { Badge } from "@/components/ui/Badge";
import { ShopContact } from "@/components/shop/ShopContact";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const activity = await prisma.shopActivity.findUnique({
    where: { id: Number(id) },
    select: { name: true, description: true },
  });
  if (!activity) return { title: "Activite introuvable" };
  return {
    title: `${activity.name} — EraLocal`,
    description: activity.description ?? activity.name,
  };
}

export default async function ActivityDetailPage({ params }: PageProps) {
  const { id } = await params;
  const activity = await prisma.shopActivity.findUnique({
    where: { id: Number(id) },
    include: {
      shop: {
        select: {
          name: true,
          slug: true,
          phone: true,
          website: true,
          verificationStatus: true,
        },
      },
    },
  });

  if (!activity || activity.shop.verificationStatus !== "verified") notFound();

  const images = (activity.images as string[]) ?? [];

  return (
    <div>
      {/* Images */}
      {(activity.mainImage || images.length > 0) && (
        <div className="relative w-full h-56 overflow-hidden">
          <img
            src={activity.mainImage ?? images[0]}
            alt={activity.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="px-4 md:px-6 py-4 space-y-4">
        <h1 className="text-[1.8rem] font-semibold font-serif text-text">
          {activity.name}
        </h1>

        <div className="flex gap-2 flex-wrap">
          {activity.category && (
            <Badge variant="purple">{activity.category}</Badge>
          )}
          {activity.priceInfo && (
            <Badge variant="green">{activity.priceInfo}</Badge>
          )}
          {activity.duration && (
            <Badge variant="cyan">🕐 {activity.duration}</Badge>
          )}
        </div>

        {activity.description && (
          <p className="text-sm text-text2 leading-relaxed">
            {activity.description}
          </p>
        )}

        {activity.address && (
          <p className="text-sm text-text">📍 {activity.address}</p>
        )}

        <p className="text-sm text-text2">🏪 Propose par {activity.shop.name}</p>

        <ShopContact
          phone={activity.phone ?? activity.shop.phone}
          website={activity.website ?? activity.shop.website}
          latitude={activity.latitude}
          longitude={activity.longitude}
          address={activity.address}
        />
      </div>
    </div>
  );
}
