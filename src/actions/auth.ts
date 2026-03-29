"use server";

import bcrypt from "bcrypt";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { createSession, destroySession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import {
  loginSchema,
  loginEmailSchema,
  registerClientSchema,
  isValidSiret,
  registerMerchantSchema,
} from "@/lib/validations/auth";

type ActionResult = {
  error?: string;
  success?: boolean;
  redirectTo?: string;
  shopCode?: string;
  pin?: string;
};

async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

// --- Login marchand par code boutique + PIN ---

export async function loginMerchant(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    shopCode: formData.get("shopCode") as string,
    pin: formData.get("pin") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Identifiants invalides" };
  }

  const ip = await getClientIp();
  const rateLimitKey = `login:merchant:${ip}`;
  const { allowed, remainingMs } = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
  if (!allowed) {
    const minutes = Math.ceil(remainingMs / 60000);
    return { error: `Trop de tentatives. Reessayez dans ${minutes} minute(s).` };
  }

  const { shopCode, pin } = parsed.data;

  const shop = await prisma.shop.findUnique({
    where: { slug: shopCode },
    select: {
      id: true,
      ownerPinHash: true,
      totpEnabled: true,
    },
  });

  if (!shop?.ownerPinHash) {
    return { error: "Identifiants invalides" };
  }

  const pinValid = await bcrypt.compare(pin, shop.ownerPinHash);
  if (!pinValid) {
    return { error: "Identifiants invalides" };
  }

  if (shop.totpEnabled) {
    return { redirectTo: `/auth/2fa?shopId=${shop.id}` };
  }

  await createSession({
    userId: shop.id,
    userType: "merchant",
    shopId: shop.id,
  });

  return { success: true, redirectTo: "/dashboard" };
}

// --- Login marchand par email ---

export async function loginMerchantEmail(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginEmailSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Identifiants invalides" };
  }

  const ip = await getClientIp();
  const rateLimitKey = `login:merchant-email:${ip}`;
  const { allowed, remainingMs } = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
  if (!allowed) {
    const minutes = Math.ceil(remainingMs / 60000);
    return { error: `Trop de tentatives. Reessayez dans ${minutes} minute(s).` };
  }

  const { email, password } = parsed.data;

  const shop = await prisma.shop.findUnique({
    where: { email },
    select: {
      id: true,
      passwordHash: true,
      totpEnabled: true,
    },
  });

  if (!shop) {
    return { error: "Identifiants invalides" };
  }

  const passwordValid = await bcrypt.compare(password, shop.passwordHash);
  if (!passwordValid) {
    return { error: "Identifiants invalides" };
  }

  if (shop.totpEnabled) {
    return { redirectTo: `/auth/2fa?shopId=${shop.id}` };
  }

  await createSession({
    userId: shop.id,
    userType: "merchant",
    shopId: shop.id,
  });

  return { success: true, redirectTo: "/dashboard" };
}

// --- Login consommateur ---

export async function loginClient(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginEmailSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Identifiants invalides" };
  }

  const ip = await getClientIp();
  const { allowed, remainingMs } = checkRateLimit(`login:client:${ip}`, 5, 15 * 60 * 1000);
  if (!allowed) {
    const minutes = Math.ceil(remainingMs / 60000);
    return { error: `Trop de tentatives. Reessayez dans ${minutes} minute(s).` };
  }

  const { email, password } = parsed.data;

  const client = await prisma.client.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });

  if (!client) {
    return { error: "Identifiants invalides" };
  }

  const passwordValid = await bcrypt.compare(password, client.passwordHash);
  if (!passwordValid) {
    return { error: "Identifiants invalides" };
  }

  await createSession({
    userId: client.id,
    userType: "consumer",
  });

  return { success: true };
}

// --- Inscription consommateur ---

export async function registerClient(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    name: (formData.get("name") as string) || undefined,
  };

  const parsed = registerClientSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  const ip = await getClientIp();
  const { allowed } = checkRateLimit(`register:client:${ip}`, 3, 15 * 60 * 1000);
  if (!allowed) {
    return { error: "Trop de tentatives. Reessayez plus tard." };
  }

  const { email, password, name } = parsed.data;

  const existing = await prisma.client.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email deja utilise" };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const client = await prisma.client.create({
    data: { email, passwordHash, name },
  });

  await createSession({
    userId: client.id,
    userType: "consumer",
  });

  return { success: true };
}

// --- Login admin ---

export async function loginAdmin(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginEmailSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Identifiants invalides" };
  }

  const ip = await getClientIp();
  const { allowed, remainingMs } = checkRateLimit(`login:admin:${ip}`, 3, 15 * 60 * 1000);
  if (!allowed) {
    const minutes = Math.ceil(remainingMs / 60000);
    return { error: `Trop de tentatives. Reessayez dans ${minutes} minute(s).` };
  }

  const { email, password } = parsed.data;

  const admin = await prisma.admin.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });

  if (!admin) {
    return { error: "Identifiants invalides" };
  }

  const passwordValid = await bcrypt.compare(password, admin.passwordHash);
  if (!passwordValid) {
    return { error: "Identifiants invalides" };
  }

  await createSession({
    userId: admin.id,
    userType: "admin",
  });

  return { success: true, redirectTo: "/admin/boutiques" };
}

// --- Login ville ---

export async function loginCity(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginEmailSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Identifiants invalides" };
  }

  const ip = await getClientIp();
  const { allowed, remainingMs } = checkRateLimit(`login:city:${ip}`, 5, 15 * 60 * 1000);
  if (!allowed) {
    const minutes = Math.ceil(remainingMs / 60000);
    return { error: `Trop de tentatives. Reessayez dans ${minutes} minute(s).` };
  }

  const { email, password } = parsed.data;

  const city = await prisma.cityAccount.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });

  if (!city) {
    return { error: "Identifiants invalides" };
  }

  const passwordValid = await bcrypt.compare(password, city.passwordHash);
  if (!passwordValid) {
    return { error: "Identifiants invalides" };
  }

  await createSession({
    userId: city.id,
    userType: "city",
  });

  return { success: true, redirectTo: "/city/profil" };
}

// --- Inscription marchand ---

function generateShopCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "SS-";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generatePin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function registerMerchant(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    name: formData.get("name") as string,
    address: formData.get("address") as string,
    postalCode: formData.get("postalCode") as string,
    city: formData.get("city") as string,
    siret: formData.get("siret") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = registerMerchantSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  const { name, address, postalCode, city, siret, phone, email, password } =
    parsed.data;

  if (!isValidSiret(siret)) {
    return { error: "SIRET invalide (verification Luhn echouee)" };
  }

  const ip = await getClientIp();
  const { allowed } = checkRateLimit(`register:merchant:${ip}`, 3, 15 * 60 * 1000);
  if (!allowed) {
    return { error: "Trop de tentatives. Reessayez plus tard." };
  }

  const existing = await prisma.shop.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email deja utilise" };
  }

  // Generate unique shop code
  let shopCode: string;
  let codeExists = true;
  do {
    shopCode = generateShopCode();
    const found = await prisma.shop.findUnique({ where: { slug: shopCode } });
    codeExists = !!found;
  } while (codeExists);

  const pin = generatePin();
  const [passwordHash, ownerPinHash] = await Promise.all([
    bcrypt.hash(password, 12),
    bcrypt.hash(pin, 12),
  ]);

  const shop = await prisma.shop.create({
    data: {
      name,
      email,
      passwordHash,
      slug: shopCode,
      address,
      city,
      postalCode,
      phone,
      siret,
      ownerPinHash,
    },
  });

  await createSession({
    userId: shop.id,
    userType: "merchant",
    shopId: shop.id,
  });

  return { success: true, shopCode, pin };
}

// --- Logout ---

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/");
}
