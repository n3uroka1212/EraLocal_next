"use server";

import { prisma } from "@/lib/db/client";
import { getSession, destroySession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

type ActionResult = {
  error?: string;
  success?: boolean;
  data?: Record<string, unknown>;
};

/**
 * RGPD: Right of Access + Portability
 * Export all personal data for the current consumer
 */
export async function exportUserData(): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.userType !== "consumer") {
    return { error: "Non autorise" };
  }

  const client = await prisma.client.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      city: true,
      createdAt: true,
      lastLogin: true,
    },
  });

  if (!client) return { error: "Compte non trouve" };

  const [favorites, orders, notifications, pings] = await Promise.all([
    prisma.clientFavorite.findMany({
      where: { clientId: session.userId },
      select: { itemType: true, itemId: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { clientId: session.userId },
      select: {
        orderNumber: true,
        status: true,
        total: true,
        clientName: true,
        clientPhone: true,
        pickupTime: true,
        createdAt: true,
        items: {
          select: { productName: true, quantity: true, unitPrice: true },
        },
      },
    }),
    prisma.clientNotification.findMany({
      where: { clientId: session.userId },
      select: { type: true, title: true, message: true, createdAt: true },
    }),
    prisma.stockPing.findMany({
      where: { clientId: session.userId },
      select: {
        productName: true,
        status: true,
        response: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    success: true,
    data: {
      profile: client,
      favorites,
      orders,
      notifications,
      pings,
      exportDate: new Date().toISOString(),
      format: "RGPD_EXPORT_V1",
    },
  };
}

/**
 * RGPD: Right to Erasure (Right to be forgotten)
 * Delete all personal data for the current consumer
 */
export async function deleteAccount(): Promise<void> {
  const session = await getSession();
  if (!session || session.userType !== "consumer") {
    return;
  }

  const clientId = session.userId;

  // Delete all personal data (favorites, notifications, pings)
  await Promise.all([
    prisma.clientFavorite.deleteMany({ where: { clientId } }),
    prisma.clientNotification.deleteMany({ where: { clientId } }),
    prisma.stockPing.deleteMany({ where: { clientId } }),
  ]);

  // Anonymize orders (keep for accounting, remove personal data)
  await prisma.order.updateMany({
    where: { clientId },
    data: {
      clientId: null,
      clientName: "Compte supprime",
      clientEmail: null,
      clientPhone: null,
      notes: null,
    },
  });

  // Delete the client account
  await prisma.client.delete({ where: { id: clientId } });

  // Destroy session and redirect
  await destroySession();
  redirect("/");
}

/**
 * RGPD: Anonymize old analytics events (> 13 months per CNIL)
 */
export async function anonymizeOldAnalytics(): Promise<{ count: number }> {
  const session = await getSession();
  if (!session || session.userType !== "admin") {
    return { count: 0 };
  }

  const thirteenMonthsAgo = new Date();
  thirteenMonthsAgo.setMonth(thirteenMonthsAgo.getMonth() - 13);

  const result = await prisma.analyticsEvent.updateMany({
    where: {
      createdAt: { lt: thirteenMonthsAgo },
      clientId: { not: null },
    },
    data: {
      clientId: null,
      sessionId: null,
      userAgent: null,
    },
  });

  return { count: result.count };
}

/**
 * RGPD: Delete expired verification documents (> 6 months after verification)
 */
export async function purgeExpiredDocuments(): Promise<{ count: number }> {
  const session = await getSession();
  if (!session || session.userType !== "admin") {
    return { count: 0 };
  }

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const result = await prisma.shop.updateMany({
    where: {
      verificationStatus: "verified",
      verificationDate: { lt: sixMonthsAgo },
      OR: [
        { docIdRecto: { not: null } },
        { docIdVerso: { not: null } },
        { docJustificatif: { not: null } },
        { docKbis: { not: null } },
      ],
    },
    data: {
      docIdRecto: null,
      docIdVerso: null,
      docJustificatif: null,
      docKbis: null,
    },
  });

  return { count: result.count };
}
