"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { getSession } from "@/lib/auth/session";

type ActionResult = {
  error?: string;
  success?: boolean;
  id?: number;
};

type FavoriteType = "shop" | "product" | "event" | "activity";

async function getClientId(): Promise<number | null> {
  const session = await getSession();
  if (!session || session.userType !== "consumer") {
    return null;
  }
  return session.userId;
}

export async function addFavorite(
  itemType: FavoriteType,
  itemId: number,
): Promise<ActionResult> {
  const clientId = await getClientId();
  if (!clientId) return { error: "Non autorise" };

  // Check if already favorited
  const existing = await prisma.clientFavorite.findUnique({
    where: {
      clientId_itemType_itemId: {
        clientId,
        itemType,
        itemId,
      },
    },
  });

  if (existing) {
    return { success: true, id: existing.id };
  }

  const favorite = await prisma.clientFavorite.create({
    data: { clientId, itemType, itemId },
  });

  revalidatePath("/favoris");
  return { success: true, id: favorite.id };
}

export async function removeFavorite(
  itemType: FavoriteType,
  itemId: number,
): Promise<ActionResult> {
  const clientId = await getClientId();
  if (!clientId) return { error: "Non autorise" };

  await prisma.clientFavorite.deleteMany({
    where: { clientId, itemType, itemId },
  });

  revalidatePath("/favoris");
  return { success: true };
}
