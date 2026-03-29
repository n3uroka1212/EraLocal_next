import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { ActivitiesManagementClient } from "@/components/merchant/activities/ActivitiesManagementClient";
import { ActivitiesPageClient } from "@/components/activities/ActivitiesPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activites — EraLocal",
  description: "Decouvrez les activites locales : loisirs, sport, culture et plus",
};

export default async function ActivitesPage() {
  const session = await getSession();

  if (session?.userType === "merchant" && session.shopId) {
    const [activities, folders] = await Promise.all([
      prisma.shopActivity.findMany({
        where: { shopId: session.shopId },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.activityFolder.findMany({
        where: { shopId: session.shopId },
        include: { activities: { select: { id: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return (
      <ActivitiesManagementClient
        activities={JSON.parse(JSON.stringify(activities))}
        folders={JSON.parse(JSON.stringify(folders))}
      />
    );
  }

  // Public view
  const [activities, cities] = await Promise.all([
    prisma.shopActivity.findMany({
      where: {
        active: true,
        shop: { verificationStatus: "verified" },
      },
      include: {
        shop: { select: { name: true } },
        folder: { select: { code: true } },
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.cityAccount.findMany({
      select: {
        id: true,
        name: true,
        department: true,
        logoEmoji: true,
      },
    }),
  ]);

  const formattedActivities = activities.map((a) => ({
    id: a.id,
    name: a.name,
    category: a.category,
    mainImage: a.mainImage,
    priceInfo: a.priceInfo,
    shopName: a.shop.name,
    isPrivate: !!a.folder?.code,
    folderCode: a.folder?.code ?? null,
  }));

  return (
    <ActivitiesPageClient
      activities={formattedActivities}
      cities={cities}
    />
  );
}
