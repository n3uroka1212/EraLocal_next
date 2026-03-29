"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { getSession } from "@/lib/auth/session";
import type { OrderStatus } from "@/generated/prisma/enums";
import { isValidTransition } from "@/lib/validations/order";

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

async function verifyOrderOwnership(
  orderId: number,
  shopId: number,
): Promise<boolean> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { shopId: true },
  });
  return order?.shopId === shopId;
}

export async function updateOrderStatus(
  orderId: number,
  newStatus: string,
): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  if (!(await verifyOrderOwnership(orderId, shopId))) {
    return { error: "Commande non trouvee" };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, clientId: true, shopId: true },
  });

  if (!order) return { error: "Commande non trouvee" };

  if (!isValidTransition(order.status, newStatus)) {
    return { error: `Transition invalide : ${order.status} → ${newStatus}` };
  }

  const updateData: Record<string, unknown> = { status: newStatus };
  if (newStatus === "ready") {
    updateData.readyAt = new Date();
  } else if (newStatus === "collected") {
    updateData.collectedAt = new Date();
  }

  await prisma.order.update({
    where: { id: orderId },
    data: updateData as { status: OrderStatus; readyAt?: Date; collectedAt?: Date },
  });

  // Notify consumer when order is ready
  if (newStatus === "ready" && order.clientId) {
    const shop = await prisma.shop.findUnique({
      where: { id: order.shopId },
      select: { name: true, logo: true, logoEmoji: true },
    });

    await prisma.clientNotification.create({
      data: {
        clientId: order.clientId,
        shopId: order.shopId,
        type: "order_ready",
        title: "Commande prete !",
        message: `Votre commande chez ${shop?.name ?? "la boutique"} est prete a etre recuperee.`,
        targetId: orderId,
        shopName: shop?.name,
        shopLogo: shop?.logo ?? shop?.logoEmoji,
      },
    });
  }

  revalidatePath("/commandes");
  revalidatePath(`/commandes/${orderId}`);
  return { success: true };
}

export async function cancelOrder(
  orderId: number,
  reason?: string,
): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  if (!(await verifyOrderOwnership(orderId, shopId))) {
    return { error: "Commande non trouvee" };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, paymentStatus: true, stripePaymentIntentId: true, clientId: true, shopId: true },
  });

  if (!order) return { error: "Commande non trouvee" };

  if (!isValidTransition(order.status, "cancelled")) {
    return { error: "Cette commande ne peut plus etre annulee" };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "cancelled",
      cancelledBy: "merchant",
      cancelReason: reason?.slice(0, 500),
    },
  });

  // TODO: Initiate Stripe refund if payment was completed
  // if (order.paymentStatus === "succeeded" && order.stripePaymentIntentId) {
  //   await refundPayment(order.stripePaymentIntentId);
  // }

  // Notify consumer of cancellation
  if (order.clientId) {
    const shop = await prisma.shop.findUnique({
      where: { id: order.shopId },
      select: { name: true, logo: true, logoEmoji: true },
    });

    await prisma.clientNotification.create({
      data: {
        clientId: order.clientId,
        shopId: order.shopId,
        type: "order_cancelled",
        title: "Commande annulee",
        message: reason
          ? `Votre commande a ete annulee : ${reason}`
          : "Votre commande a ete annulee par le marchand.",
        targetId: orderId,
        shopName: shop?.name,
        shopLogo: shop?.logo ?? shop?.logoEmoji,
      },
    });
  }

  revalidatePath("/commandes");
  revalidatePath(`/commandes/${orderId}`);
  return { success: true };
}
