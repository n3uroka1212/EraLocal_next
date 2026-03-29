import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { DashboardClient } from "@/components/merchant/dashboard/DashboardClient";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session || session.userType !== "merchant" || !session.shopId) {
    redirect("/auth/login");
  }

  const shop = await prisma.shop.findUnique({
    where: { id: session.shopId },
    select: {
      id: true,
      name: true,
      onboardingComplete: true,
      verificationStatus: true,
      planType: true,
      slug: true,
    },
  });

  if (!shop) redirect("/auth/login");

  if (!shop.onboardingComplete) {
    redirect("/onboarding");
  }

  const [productCount, pendingOrderCount, pendingPingCount] = await Promise.all(
    [
      prisma.catalogProduct.count({ where: { shopId: session.shopId } }),
      prisma.order.count({
        where: { shopId: session.shopId, status: { in: ["pending", "paid", "preparing"] } },
      }),
      prisma.stockPing.count({
        where: { shopId: session.shopId, status: "pending" },
      }),
    ],
  );

  return (
    <DashboardClient
      shop={{
        name: shop.name,
        slug: shop.slug,
        verificationStatus: shop.verificationStatus,
        planType: shop.planType ?? "free",
      }}
      metrics={{
        productCount,
        pendingOrderCount,
        pendingPingCount,
      }}
    />
  );
}
