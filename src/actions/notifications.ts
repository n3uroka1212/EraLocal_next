"use server";

import { prisma } from "@/lib/db/client";
import { getSession } from "@/lib/auth/session";

type ActionResult = {
  error?: string;
  success?: boolean;
};

async function getClientId(): Promise<number | null> {
  const session = await getSession();
  if (!session || session.userType !== "consumer") {
    return null;
  }
  return session.userId;
}

export async function markNotificationsRead(
  ids?: number[],
): Promise<ActionResult> {
  const clientId = await getClientId();
  if (!clientId) return { error: "Non autorise" };

  if (ids && ids.length > 0) {
    await prisma.clientNotification.updateMany({
      where: { clientId, id: { in: ids } },
      data: { read: true },
    });
  } else {
    await prisma.clientNotification.updateMany({
      where: { clientId, read: false },
      data: { read: true },
    });
  }

  return { success: true };
}

export async function clearNotifications(): Promise<ActionResult> {
  const clientId = await getClientId();
  if (!clientId) return { error: "Non autorise" };

  await prisma.clientNotification.deleteMany({
    where: { clientId },
  });

  return { success: true };
}
