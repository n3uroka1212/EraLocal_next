"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { getSession } from "@/lib/auth/session";
import { pingResponseSchema } from "@/lib/validations/ping";

type ActionResult = {
  error?: string;
  success?: boolean;
};

async function getShopId(): Promise<number | null> {
  const session = await getSession();
  if (!session || session.userType !== "merchant" || !session.shopId) {
    return null;
  }
  return session.shopId;
}

export async function respondToPing(
  pingId: number,
  response: string,
): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  const parsed = pingResponseSchema.safeParse({ response });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Reponse invalide" };
  }

  const ping = await prisma.stockPing.findUnique({
    where: { id: pingId },
    select: { shopId: true, status: true, clientId: true, productName: true },
  });

  if (ping?.shopId !== shopId) {
    return { error: "Ping non trouve" };
  }

  if (ping.status !== "pending") {
    return { error: "Ce ping a deja ete traite" };
  }

  await prisma.stockPing.update({
    where: { id: pingId },
    data: {
      status: "responded",
      response: parsed.data.response,
      respondedAt: new Date(),
    },
  });

  // Notify consumer
  if (ping.clientId) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { name: true, logo: true, logoEmoji: true },
    });

    const responseText =
      parsed.data.response === "en_stock"
        ? `"${ping.productName}" est en stock !`
        : `"${ping.productName}" est en rupture.`;

    await prisma.clientNotification.create({
      data: {
        clientId: ping.clientId,
        shopId,
        type: "ping_response",
        title: "Reponse a votre demande",
        message: responseText,
        shopName: shop?.name,
        shopLogo: shop?.logo ?? shop?.logoEmoji,
      },
    });
  }

  revalidatePath("/pings");
  return { success: true };
}

export async function deletePing(pingId: number): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  const ping = await prisma.stockPing.findUnique({
    where: { id: pingId },
    select: { shopId: true },
  });

  if (ping?.shopId !== shopId) {
    return { error: "Ping non trouve" };
  }

  await prisma.stockPing.delete({ where: { id: pingId } });

  revalidatePath("/pings");
  return { success: true };
}
