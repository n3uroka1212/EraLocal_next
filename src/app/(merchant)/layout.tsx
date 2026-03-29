import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { MerchantLayoutClient } from "@/components/layouts/MerchantLayout";
import { prisma } from "@/lib/db/client";

export default async function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.userType !== "merchant") {
    redirect("/auth/login");
  }

  let isPremium = false;
  if (session.shopId) {
    const shop = await prisma.shop.findUnique({
      where: { id: session.shopId },
      select: { planType: true },
    });
    isPremium = shop?.planType === "premium";
  }

  return (
    <MerchantLayoutClient isPremium={isPremium}>
      {children}
    </MerchantLayoutClient>
  );
}
