"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { getSession } from "@/lib/auth/session";
import { cityProfileSchema, cityPointSchema } from "@/lib/validations/city";

type ActionResult = {
  error?: string;
  success?: boolean;
  id?: number;
};

async function getCityId(): Promise<number | null> {
  const session = await getSession();
  if (!session || session.userType !== "city") {
    return null;
  }
  return session.userId;
}

// --- City Profile ---

export async function updateCityProfile(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const cityId = await getCityId();
  if (!cityId) return { error: "Non autorise" };

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    department: (formData.get("department") as string) || undefined,
    region: (formData.get("region") as string) || undefined,
    slogan: (formData.get("slogan") as string) || undefined,
    cityCategory: (formData.get("cityCategory") as string) || undefined,
    contactName: (formData.get("contactName") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
  };

  const parsed = cityProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  await prisma.cityAccount.update({
    where: { id: cityId },
    data: parsed.data,
  });

  revalidatePath("/city/profil");
  return { success: true };
}

export async function uploadCityLogo(formData: FormData): Promise<ActionResult> {
  const cityId = await getCityId();
  if (!cityId) return { error: "Non autorise" };

  const file = formData.get("logo") as File;
  if (!file || file.size === 0) return { error: "Aucun fichier" };
  if (file.size > 2 * 1024 * 1024) return { error: "Fichier trop volumineux (max 2 Mo)" };

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Format non supporte (JPEG, PNG, WebP)" };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

  await prisma.cityAccount.update({
    where: { id: cityId },
    data: { logo: base64 },
  });

  revalidatePath("/city/profil");
  return { success: true };
}

export async function deleteCityLogo(): Promise<ActionResult> {
  const cityId = await getCityId();
  if (!cityId) return { error: "Non autorise" };

  await prisma.cityAccount.update({
    where: { id: cityId },
    data: { logo: null },
  });

  revalidatePath("/city/profil");
  return { success: true };
}

export async function uploadCityBanner(formData: FormData): Promise<ActionResult> {
  const cityId = await getCityId();
  if (!cityId) return { error: "Non autorise" };

  const file = formData.get("banner") as File;
  if (!file || file.size === 0) return { error: "Aucun fichier" };
  if (file.size > 5 * 1024 * 1024) return { error: "Fichier trop volumineux (max 5 Mo)" };

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Format non supporte (JPEG, PNG, WebP)" };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

  await prisma.cityAccount.update({
    where: { id: cityId },
    data: { banner: base64 },
  });

  revalidatePath("/city/profil");
  return { success: true };
}

export async function deleteCityBanner(): Promise<ActionResult> {
  const cityId = await getCityId();
  if (!cityId) return { error: "Non autorise" };

  await prisma.cityAccount.update({
    where: { id: cityId },
    data: { banner: null },
  });

  revalidatePath("/city/profil");
  return { success: true };
}

// --- City Points of Interest ---

export async function createCityPoint(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const cityId = await getCityId();
  if (!cityId) return { error: "Non autorise" };

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    history: (formData.get("history") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    category: (formData.get("category") as string) || undefined,
    latitude: formData.get("latitude") ? Number(formData.get("latitude")) : undefined,
    longitude: formData.get("longitude") ? Number(formData.get("longitude")) : undefined,
    active: true,
  };

  const parsed = cityPointSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  const maxOrder = await prisma.cityPoint.aggregate({
    where: { cityId },
    _max: { sortOrder: true },
  });

  const point = await prisma.cityPoint.create({
    data: {
      cityId,
      ...parsed.data,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath("/city/points");
  return { success: true, id: point.id };
}

export async function updateCityPoint(
  pointId: number,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const cityId = await getCityId();
  if (!cityId) return { error: "Non autorise" };

  const existing = await prisma.cityPoint.findUnique({
    where: { id: pointId },
    select: { cityId: true },
  });
  if (existing?.cityId !== cityId) {
    return { error: "Point non trouve" };
  }

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    history: (formData.get("history") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    category: (formData.get("category") as string) || undefined,
    latitude: formData.get("latitude") ? Number(formData.get("latitude")) : undefined,
    longitude: formData.get("longitude") ? Number(formData.get("longitude")) : undefined,
    active: formData.get("active") !== "false",
  };

  const parsed = cityPointSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  await prisma.cityPoint.update({
    where: { id: pointId },
    data: parsed.data,
  });

  revalidatePath("/city/points");
  return { success: true };
}

export async function deleteCityPoint(pointId: number): Promise<ActionResult> {
  const cityId = await getCityId();
  if (!cityId) return { error: "Non autorise" };

  const existing = await prisma.cityPoint.findUnique({
    where: { id: pointId },
    select: { cityId: true },
  });
  if (existing?.cityId !== cityId) {
    return { error: "Point non trouve" };
  }

  await prisma.cityPoint.delete({ where: { id: pointId } });

  revalidatePath("/city/points");
  return { success: true };
}

export async function uploadCityPointImage(
  pointId: number,
  formData: FormData,
): Promise<ActionResult> {
  const cityId = await getCityId();
  if (!cityId) return { error: "Non autorise" };

  const existing = await prisma.cityPoint.findUnique({
    where: { id: pointId },
    select: { cityId: true },
  });
  if (existing?.cityId !== cityId) {
    return { error: "Point non trouve" };
  }

  const file = formData.get("image") as File;
  if (!file || file.size === 0) return { error: "Aucun fichier" };
  if (file.size > 5 * 1024 * 1024) return { error: "Fichier trop volumineux (max 5 Mo)" };

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

  await prisma.cityPoint.update({
    where: { id: pointId },
    data: { image: base64 },
  });

  revalidatePath("/city/points");
  return { success: true };
}
