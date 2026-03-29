"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { getSession } from "@/lib/auth/session";
import {
  onboardingSchema,
  shopProfileSchema,
} from "@/lib/validations/shop";

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

// --- Onboarding ---

export async function updateOnboarding(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  const raw = {
    businessType: formData.get("businessType") as string,
    category: formData.get("category") as string,
    shopName: formData.get("shopName") as string,
    logoEmoji: formData.get("logoEmoji") as string || undefined,
  };

  const parsed = onboardingSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  const { businessType, category, shopName, logoEmoji } = parsed.data;

  await prisma.shop.update({
    where: { id: shopId },
    data: {
      businessType: businessType as "commercant" | "activite",
      category,
      name: shopName,
      logoEmoji: logoEmoji || null,
      onboardingComplete: true,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/vitrine");
  return { success: true };
}

// --- Profil boutique ---

export async function updateShopProfile(
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
    postalCode: (formData.get("postalCode") as string) || undefined,
    city: (formData.get("city") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    notificationEmail:
      (formData.get("notificationEmail") as string) || undefined,
    website: (formData.get("website") as string) || undefined,
    logoEmoji: (formData.get("logoEmoji") as string) || undefined,
    openingHours: formData.get("openingHours")
      ? JSON.parse(formData.get("openingHours") as string)
      : undefined,
    socialMedia: formData.get("socialMedia")
      ? JSON.parse(formData.get("socialMedia") as string)
      : undefined,
  };

  const parsed = shopProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  const data = parsed.data;

  await prisma.shop.update({
    where: { id: shopId },
    data: {
      name: data.name,
      description: data.description || null,
      category: data.category || null,
      address: data.address || null,
      postalCode: data.postalCode || null,
      city: data.city || null,
      phone: data.phone || null,
      notificationEmail: data.notificationEmail || null,
      website: data.website || null,
      logoEmoji: data.logoEmoji || null,
      openingHours: data.openingHours ?? undefined,
      socialMedia: data.socialMedia ?? undefined,
    },
  });

  revalidatePath("/boutique");
  revalidatePath("/vitrine");
  return { success: true };
}

// --- Upload banner ---

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

function validateImageFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return "Fichier trop volumineux (max 5MB)";
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return "Type de fichier non autorise (JPEG, PNG, WebP uniquement)";
  }
  return null;
}

export async function uploadBanner(
  formData: FormData,
): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  const file = formData.get("file") as File | null;
  if (!file) return { error: "Aucun fichier" };

  const validationError = validateImageFile(file);
  if (validationError) return { error: validationError };

  // Read file bytes for magic bytes validation
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!isValidImageMagicBytes(bytes)) {
    return { error: "Fichier invalide (contenu non reconnu comme image)" };
  }

  // Store as base64 data URI for simplicity (production: use object storage)
  const base64 = Buffer.from(bytes).toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  await prisma.shop.update({
    where: { id: shopId },
    data: { banner: dataUri },
  });

  revalidatePath("/boutique");
  revalidatePath("/vitrine");
  return { success: true };
}

export async function deleteBanner(): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  await prisma.shop.update({
    where: { id: shopId },
    data: { banner: null },
  });

  revalidatePath("/boutique");
  revalidatePath("/vitrine");
  return { success: true };
}

export async function uploadLogo(
  formData: FormData,
): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  const file = formData.get("file") as File | null;
  if (!file) return { error: "Aucun fichier" };

  const validationError = validateImageFile(file);
  if (validationError) return { error: validationError };

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!isValidImageMagicBytes(bytes)) {
    return { error: "Fichier invalide" };
  }

  const base64 = Buffer.from(bytes).toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  await prisma.shop.update({
    where: { id: shopId },
    data: { logo: dataUri, logoEmoji: null },
  });

  revalidatePath("/boutique");
  revalidatePath("/vitrine");
  return { success: true };
}

export async function deleteLogo(): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  await prisma.shop.update({
    where: { id: shopId },
    data: { logo: null },
  });

  revalidatePath("/boutique");
  revalidatePath("/vitrine");
  return { success: true };
}

// --- Photos gallery ---

export async function addPhoto(
  formData: FormData,
): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  const photoCount = await prisma.shopPhoto.count({ where: { shopId } });
  if (photoCount >= 10) {
    return { error: "Maximum 10 photos atteint" };
  }

  const file = formData.get("file") as File | null;
  if (!file) return { error: "Aucun fichier" };

  const validationError = validateImageFile(file);
  if (validationError) return { error: validationError };

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!isValidImageMagicBytes(bytes)) {
    return { error: "Fichier invalide" };
  }

  const base64 = Buffer.from(bytes).toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  await prisma.shopPhoto.create({
    data: { shopId, url: dataUri },
  });

  revalidatePath("/boutique");
  revalidatePath("/vitrine");
  return { success: true };
}

export async function deletePhoto(photoId: number): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  const photo = await prisma.shopPhoto.findUnique({
    where: { id: photoId },
    select: { shopId: true },
  });

  if (!photo || photo.shopId !== shopId) {
    return { error: "Photo non trouvee" };
  }

  await prisma.shopPhoto.delete({ where: { id: photoId } });

  revalidatePath("/boutique");
  revalidatePath("/vitrine");
  return { success: true };
}

// --- Geocoding ---

export async function geocodeAddress(
  address: string,
  postalCode: string,
  city: string,
): Promise<{ lat: number; lng: number } | { error: string }> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  const query = encodeURIComponent(`${address}, ${postalCode} ${city}, France`);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "EraLocal/1.0" },
    });
    const data = await res.json();

    if (!data || data.length === 0) {
      return { error: "Adresse non trouvee" };
    }

    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);

    await prisma.shop.update({
      where: { id: shopId },
      data: { latitude: lat, longitude: lng },
    });

    revalidatePath("/boutique");
    return { lat, lng };
  } catch {
    return { error: "Erreur de geocodage" };
  }
}

// --- Magic bytes validation ---

function isValidImageMagicBytes(bytes: Uint8Array): boolean {
  if (bytes.length < 4) return false;

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return true;

  // PNG: 89 50 4E 47
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  )
    return true;

  // WebP: RIFF....WEBP
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes.length >= 12 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  )
    return true;

  return false;
}
