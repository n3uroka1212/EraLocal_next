import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { SecuritySettingsClient } from "@/components/merchant/settings/SecuritySettingsClient";

export default async function SecuritySettingsPage() {
  const session = await getSession();
  if (!session || session.userType !== "merchant" || !session.shopId) {
    redirect("/auth/login");
  }

  const shop = await prisma.shop.findUnique({
    where: { id: session.shopId },
    select: { totpEnabled: true },
  });

  if (!shop) redirect("/auth/login");

  return <SecuritySettingsClient totpEnabled={shop.totpEnabled} />;
}
