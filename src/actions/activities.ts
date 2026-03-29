"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { getSession } from "@/lib/auth/session";
import { activitySchema, folderSchema } from "@/lib/validations/activity";

type ActionResult = {
  error?: string;
  success?: boolean;
  id?: number;
  code?: string;
};

async function getShopId(): Promise<number | null> {
  const session = await getSession();
  if (!session || session.userType !== "merchant" || !session.shopId) {
    return null;
  }
  return session.shopId;
}

function generateFolderCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

// --- CRUD Activite ---

export async function createActivity(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    category: (formData.get("category") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    latitude: formData.get("latitude") ? Number(formData.get("latitude")) : undefined,
    longitude: formData.get("longitude") ? Number(formData.get("longitude")) : undefined,
    phone: (formData.get("phone") as string) || undefined,
    website: (formData.get("website") as string) || undefined,
    priceInfo: (formData.get("priceInfo") as string) || undefined,
    duration: (formData.get("duration") as string) || undefined,
    folderId: formData.get("folderId") ? Number(formData.get("folderId")) : null,
    active: true,
  };

  const parsed = activitySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  // Verify folder belongs to shop if specified
  if (parsed.data.folderId) {
    const folder = await prisma.activityFolder.findUnique({
      where: { id: parsed.data.folderId },
      select: { shopId: true },
    });
    if (folder?.shopId !== shopId) {
      return { error: "Dossier non trouve" };
    }
  }

  const maxOrder = await prisma.shopActivity.aggregate({
    where: { shopId },
    _max: { sortOrder: true },
  });

  const activity = await prisma.shopActivity.create({
    data: {
      shopId,
      ...parsed.data,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath("/activites");
  return { success: true, id: activity.id };
}

export async function updateActivity(
  activityId: number,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  const existing = await prisma.shopActivity.findUnique({
    where: { id: activityId },
    select: { shopId: true },
  });
  if (existing?.shopId !== shopId) {
    return { error: "Activite non trouvee" };
  }

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    category: (formData.get("category") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    latitude: formData.get("latitude") ? Number(formData.get("latitude")) : undefined,
    longitude: formData.get("longitude") ? Number(formData.get("longitude")) : undefined,
    phone: (formData.get("phone") as string) || undefined,
    website: (formData.get("website") as string) || undefined,
    priceInfo: (formData.get("priceInfo") as string) || undefined,
    duration: (formData.get("duration") as string) || undefined,
    folderId: formData.get("folderId") ? Number(formData.get("folderId")) : null,
    active: formData.get("active") !== "false",
  };

  const parsed = activitySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  if (parsed.data.folderId) {
    const folder = await prisma.activityFolder.findUnique({
      where: { id: parsed.data.folderId },
      select: { shopId: true },
    });
    if (folder?.shopId !== shopId) {
      return { error: "Dossier non trouve" };
    }
  }

  await prisma.shopActivity.update({
    where: { id: activityId },
    data: parsed.data,
  });

  revalidatePath("/activites");
  return { success: true };
}

export async function deleteActivity(activityId: number): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  const existing = await prisma.shopActivity.findUnique({
    where: { id: activityId },
    select: { shopId: true },
  });
  if (existing?.shopId !== shopId) {
    return { error: "Activite non trouvee" };
  }

  await prisma.shopActivity.delete({ where: { id: activityId } });

  revalidatePath("/activites");
  return { success: true };
}

export async function uploadActivityImage(
  activityId: number,
  formData: FormData,
): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  const existing = await prisma.shopActivity.findUnique({
    where: { id: activityId },
    select: { shopId: true, images: true },
  });
  if (existing?.shopId !== shopId) {
    return { error: "Activite non trouvee" };
  }

  const currentImages = (existing.images as string[]) ?? [];
  if (currentImages.length >= 10) {
    return { error: "Maximum 10 images par activite" };
  }

  const file = formData.get("image") as File;
  if (!file || file.size === 0) {
    return { error: "Aucune image fournie" };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: "Image trop volumineuse (max 5 Mo)" };
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Format d'image non supporte (JPEG, PNG, WebP)" };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `activity-${activityId}-${Date.now()}.${file.type.split("/")[1]}`;
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

  const updatedImages = [...currentImages, base64];

  await prisma.shopActivity.update({
    where: { id: activityId },
    data: { images: updatedImages },
  });

  revalidatePath("/activites");
  return { success: true };
}

export async function deleteActivityImage(
  activityId: number,
  imageIndex: number,
): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  const existing = await prisma.shopActivity.findUnique({
    where: { id: activityId },
    select: { shopId: true, images: true },
  });
  if (existing?.shopId !== shopId) {
    return { error: "Activite non trouvee" };
  }

  const currentImages = (existing.images as string[]) ?? [];
  if (imageIndex < 0 || imageIndex >= currentImages.length) {
    return { error: "Index d'image invalide" };
  }

  const updatedImages = currentImages.filter((_, i) => i !== imageIndex);

  await prisma.shopActivity.update({
    where: { id: activityId },
    data: { images: updatedImages },
  });

  revalidatePath("/activites");
  return { success: true };
}

// --- CRUD Dossier ---

export async function createFolder(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
  };

  const parsed = folderSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  const code = generateFolderCode();

  const folder = await prisma.activityFolder.create({
    data: {
      shopId,
      ...parsed.data,
      code,
    },
  });

  revalidatePath("/activites");
  return { success: true, id: folder.id, code };
}

export async function updateFolder(
  folderId: number,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  const existing = await prisma.activityFolder.findUnique({
    where: { id: folderId },
    select: { shopId: true },
  });
  if (existing?.shopId !== shopId) {
    return { error: "Dossier non trouve" };
  }

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
  };

  const parsed = folderSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  await prisma.activityFolder.update({
    where: { id: folderId },
    data: parsed.data,
  });

  revalidatePath("/activites");
  return { success: true };
}

export async function deleteFolder(folderId: number): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  const existing = await prisma.activityFolder.findUnique({
    where: { id: folderId },
    select: { shopId: true },
  });
  if (existing?.shopId !== shopId) {
    return { error: "Dossier non trouve" };
  }

  // Unlink activities from this folder before deleting
  await prisma.shopActivity.updateMany({
    where: { folderId },
    data: { folderId: null },
  });

  await prisma.activityFolder.delete({ where: { id: folderId } });

  revalidatePath("/activites");
  return { success: true };
}
