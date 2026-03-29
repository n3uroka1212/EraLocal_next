import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { PremiumGate } from "@/components/merchant/PremiumGate";
import { StockManagementClient } from "@/components/merchant/stock/StockManagementClient";

export default async function StockPage() {
  const session = await getSession();
  if (!session || session.userType !== "merchant" || !session.shopId) {
    redirect("/auth/login");
  }

  const shop = await prisma.shop.findUnique({
    where: { id: session.shopId },
    select: { planType: true },
  });

  if (shop?.planType !== "premium") {
    return <PremiumGate feature="Gestion du stock" />;
  }

  const products = await prisma.product.findMany({
    where: { shopId: session.shopId },
    orderBy: { lastUpdated: "desc" },
  });

  const catalogProducts = await prisma.catalogProduct.findMany({
    where: { shopId: session.shopId },
    select: { id: true, name: true, linkedProductId: true },
  });

  return (
    <StockManagementClient
      products={JSON.parse(JSON.stringify(products))}
      catalogProducts={JSON.parse(JSON.stringify(catalogProducts))}
    />
  );
}
