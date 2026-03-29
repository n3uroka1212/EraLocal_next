"use server";

import { prisma } from "@/lib/db/client";
import { getSession } from "@/lib/auth/session";

type ActionResult = {
  error?: string;
  success?: boolean;
  pingId?: number;
};

export async function sendPing(
  productId: number,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.userType !== "consumer") {
    return { error: "Non autorise" };
  }

  // Get product with shop info
  const product = await prisma.catalogProduct.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      image: true,
      shopId: true,
      shop: { select: { pingEnabled: true } },
    },
  });

  if (!product) {
    return { error: "Produit non trouve" };
  }

  if (!product.shop.pingEnabled) {
    return { error: "Cette boutique n'accepte pas les pings" };
  }

  // Check cooldown: 5 min per product per client
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  const recentPing = await prisma.stockPing.findFirst({
    where: {
      clientId: session.userId,
      shopId: product.shopId,
      productName: product.name,
      createdAt: { gte: fiveMinAgo },
    },
  });

  if (recentPing) {
    return { error: "Veuillez attendre 5 minutes avant de renvoyer un ping" };
  }

  const ping = await prisma.stockPing.create({
    data: {
      shopId: product.shopId,
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      clientId: session.userId,
      status: "pending",
    },
  });

  return { success: true, pingId: ping.id };
}
