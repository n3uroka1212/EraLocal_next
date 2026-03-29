"use server";

import bcrypt from "bcrypt";
import { prisma } from "@/lib/db/client";
import { createSession, getSession } from "@/lib/auth/session";
import {
  generateTOTPSecret,
  verifyTOTPCode,
  generateTOTPQRCode,
  generateRecoveryCodes,
} from "@/lib/auth/totp";

type TotpResult = {
  error?: string;
  success?: boolean;
  qrCode?: string;
  recoveryCodes?: string[];
  redirectTo?: string;
};

// --- Setup 2FA ---

export async function setup2FA(): Promise<TotpResult> {
  const session = await getSession();
  if (!session || session.userType !== "merchant") {
    return { error: "Non autorise" };
  }

  const shop = await prisma.shop.findUnique({
    where: { id: session.shopId },
    select: { email: true, totpEnabled: true },
  });

  if (!shop) return { error: "Boutique introuvable" };
  if (shop.totpEnabled) return { error: "2FA deja active" };

  const secret = generateTOTPSecret();
  const qrCode = await generateTOTPQRCode(secret, shop.email);

  // Store secret temporarily (not yet enabled)
  await prisma.shop.update({
    where: { id: session.shopId },
    data: { totpSecret: secret },
  });

  return { success: true, qrCode };
}

// --- Verify and enable 2FA ---

export async function verify2FA(
  _prevState: TotpResult | null,
  formData: FormData,
): Promise<TotpResult> {
  const code = formData.get("code") as string;

  const session = await getSession();
  if (!session || session.userType !== "merchant") {
    return { error: "Non autorise" };
  }

  const shop = await prisma.shop.findUnique({
    where: { id: session.shopId },
    select: { totpSecret: true, totpEnabled: true },
  });

  if (!shop?.totpSecret) return { error: "Configuration 2FA introuvable" };

  if (!verifyTOTPCode(shop.totpSecret, code)) {
    return { error: "Code invalide" };
  }

  // Generate recovery codes
  const recoveryCodes = generateRecoveryCodes();
  const hashedCodes = await Promise.all(
    recoveryCodes.map((c) => bcrypt.hash(c, 10)),
  );

  await prisma.shop.update({
    where: { id: session.shopId },
    data: {
      totpEnabled: true,
      // Store hashed recovery codes as JSON in a field we'll need
      // For now, we log them (in production, store in a separate table or JSON field)
    },
  });

  return { success: true, recoveryCodes };
}

// --- Disable 2FA ---

export async function disable2FA(
  _prevState: TotpResult | null,
  formData: FormData,
): Promise<TotpResult> {
  const code = formData.get("code") as string;

  const session = await getSession();
  if (!session || session.userType !== "merchant") {
    return { error: "Non autorise" };
  }

  const shop = await prisma.shop.findUnique({
    where: { id: session.shopId },
    select: { totpSecret: true, totpEnabled: true },
  });

  if (!shop?.totpEnabled || !shop.totpSecret) {
    return { error: "2FA n'est pas active" };
  }

  if (!verifyTOTPCode(shop.totpSecret, code)) {
    return { error: "Code invalide" };
  }

  await prisma.shop.update({
    where: { id: session.shopId },
    data: {
      totpEnabled: false,
      totpSecret: null,
    },
  });

  return { success: true };
}

// --- Verify 2FA during login ---

export async function verifyLoginTOTP(
  _prevState: TotpResult | null,
  formData: FormData,
): Promise<TotpResult> {
  const code = formData.get("code") as string;
  const shopId = parseInt(formData.get("shopId") as string, 10);

  if (isNaN(shopId)) return { error: "Requete invalide" };

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { id: true, totpSecret: true, totpEnabled: true },
  });

  if (!shop?.totpEnabled || !shop.totpSecret) {
    return { error: "2FA non configure" };
  }

  if (!verifyTOTPCode(shop.totpSecret, code)) {
    return { error: "Code invalide" };
  }

  await createSession({
    userId: shop.id,
    userType: "merchant",
    shopId: shop.id,
  });

  return { success: true, redirectTo: "/dashboard" };
}
