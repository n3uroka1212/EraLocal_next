import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { ClickCollectSettingsClient } from "@/components/merchant/settings/ClickCollectSettingsClient";

export default async function ClickCollectSettingsPage() {
  const session = await getSession();
  if (!session || session.userType !== "merchant" || !session.shopId) {
    redirect("/auth/login");
  }

  const shop = await prisma.shop.findUnique({
    where: { id: session.shopId },
    select: {
      clickCollectEnabled: true,
      ccPrepTime: true,
      ccInstructions: true,
      ccMinOrder: true,
      stripeOnboardingComplete: true,
    },
  });

  if (!shop) redirect("/auth/login");

  return (
    <ClickCollectSettingsClient
      settings={{
        clickCollectEnabled: shop.clickCollectEnabled,
        ccPrepTime: shop.ccPrepTime,
        ccInstructions: shop.ccInstructions,
        ccMinOrder: shop.ccMinOrder,
        stripeOnboardingComplete: shop.stripeOnboardingComplete,
      }}
    />
  );
}
