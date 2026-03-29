import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { FavoritesClient } from "@/components/consumer/favorites/FavoritesClient";

export default async function FavorisPage() {
  const session = await getSession();
  if (!session || session.userType !== "consumer") {
    redirect("/auth/client/login");
  }

  const favorites = await prisma.clientFavorite.findMany({
    where: { clientId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  // Gather IDs per type
  const shopIds = favorites
    .filter((f) => f.itemType === "shop")
    .map((f) => f.itemId);
  const productIds = favorites
    .filter((f) => f.itemType === "product")
    .map((f) => f.itemId);
  const eventIds = favorites
    .filter((f) => f.itemType === "event")
    .map((f) => f.itemId);
  const activityIds = favorites
    .filter((f) => f.itemType === "activity")
    .map((f) => f.itemId);

  // Fetch all favorited items in parallel
  const [shops, products, events, activities] = await Promise.all([
    shopIds.length > 0
      ? prisma.shop.findMany({
          where: { id: { in: shopIds } },
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            businessType: true,
            logoEmoji: true,
            banner: true,
          },
        })
      : Promise.resolve([]),
    productIds.length > 0
      ? prisma.catalogProduct.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true,
            name: true,
            price: true,
            priceUnit: true,
            category: true,
            image: true,
            shop: { select: { slug: true } },
          },
        })
      : Promise.resolve([]),
    eventIds.length > 0
      ? prisma.shopEvent.findMany({
          where: { id: { in: eventIds } },
          select: {
            id: true,
            title: true,
            eventType: true,
            eventDate: true,
            eventTime: true,
            isRecurring: true,
            shop: { select: { name: true } },
          },
        })
      : Promise.resolve([]),
    activityIds.length > 0
      ? prisma.shopActivity.findMany({
          where: { id: { in: activityIds } },
          select: {
            id: true,
            name: true,
            category: true,
            mainImage: true,
            priceInfo: true,
            shop: { select: { name: true } },
          },
        })
      : Promise.resolve([]),
  ]);

  // Serialize dates for client
  const serializedShops = shops.map((s) => ({ ...s }));
  const serializedProducts = products.map((p) => ({
    ...p,
    shopSlug: p.shop.slug,
  }));
  const serializedEvents = events.map((e) => ({
    ...e,
    eventDate: e.eventDate?.toISOString() ?? null,
    shopName: e.shop.name,
  }));
  const serializedActivities = activities.map((a) => ({
    ...a,
    shopName: a.shop.name,
  }));

  return (
    <FavoritesClient
      shops={serializedShops}
      products={serializedProducts}
      events={serializedEvents}
      activities={serializedActivities}
    />
  );
}
