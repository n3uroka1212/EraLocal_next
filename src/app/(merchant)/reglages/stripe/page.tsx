import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { StripeSettingsClient } from "@/components/merchant/settings/StripeSettingsClient";

export default async function StripeSettingsPage() {
  const session = await getSession();
  if (!session || session.userType !== "merchant" || !session.shopId) {
    redirect("/auth/login");
  }

  const shop = await prisma.shop.findUnique({
    where: { id: session.shopId },
    select: {
      stripeAccountId: true,
      stripeOnboardingComplete: true,
    },
  });

  if (!shop) redirect("/auth/login");

  return (
    <StripeSettingsClient
      stripeAccountId={shop.stripeAccountId}
      stripeOnboardingComplete={shop.stripeOnboardingComplete}
    />
  );
}
