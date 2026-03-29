import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { getSession } from "@/lib/auth/session";
import {
  AnalyticsDashboardClient,
  type AnalyticsDashboardProps,
} from "@/components/admin/AnalyticsDashboardClient";

export default async function AnalyticsPage() {
  const session = await getSession();
  if (!session || session.userType !== "admin") {
    redirect("/auth/admin");
  }

  // Fetch analytics events from the last year (max window)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  oneYearAgo.setHours(0, 0, 0, 0);

  const [events, shopCount, orderCount, clientCount] = await Promise.all([
    prisma.analyticsEvent.findMany({
      where: {
        createdAt: { gte: oneYearAgo },
        eventType: { not: "backup_created" },
      },
      select: {
        id: true,
        eventType: true,
        targetType: true,
        targetId: true,
        targetName: true,
        searchQuery: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50000,
    }),
    prisma.shop.count(),
    prisma.order.count(),
    prisma.client.count(),
  ]);

  const serializedEvents = events.map((e) => ({
    ...e,
    createdAt: e.createdAt.toISOString(),
  }));

  const props: AnalyticsDashboardProps = {
    events: serializedEvents,
    totals: {
      shops: shopCount,
      orders: orderCount,
      clients: clientCount,
    },
  };

  return <AnalyticsDashboardClient {...props} />;
}
