import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { PremiumGate } from "@/components/merchant/PremiumGate";
import { ScannerClient } from "@/components/merchant/scanner/ScannerClient";

export default async function ScannerPage() {
  const session = await getSession();
  if (!session || session.userType !== "merchant" || !session.shopId) {
    redirect("/auth/login");
  }

  const shop = await prisma.shop.findUnique({
    where: { id: session.shopId },
    select: { planType: true },
  });

  if (shop?.planType !== "premium") {
    return <PremiumGate feature="Scanner OCR" />;
  }

  const recentScans = await prisma.analyticsEvent.findMany({
    where: { eventType: "ocr_scan" },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const stockProducts = await prisma.product.findMany({
    where: { shopId: session.shopId },
    select: { id: true, name: true, quantity: true },
    orderBy: { name: "asc" },
  });

  return (
    <ScannerClient
      recentScans={JSON.parse(JSON.stringify(recentScans))}
      stockProducts={JSON.parse(JSON.stringify(stockProducts))}
    />
  );
}
