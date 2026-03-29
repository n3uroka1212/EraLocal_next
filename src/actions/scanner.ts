"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { getSession } from "@/lib/auth/session";
import { checkPermission } from "@/lib/auth/permissions";

type ActionResult = {
  error?: string;
  success?: boolean;
  id?: number;
};

type ParsedItem = {
  name: string;
  quantity: number;
  price?: number;
  matchedProductId?: number;
};

async function getAuthorizedShopId(): Promise<{ shopId: number } | { error: string }> {
  const session = await getSession();
  if (!session || session.userType !== "merchant" || !session.shopId) {
    return { error: "Non autorise" };
  }

  if (!checkPermission(session, "scan_facture")) {
    return { error: "Permission refusee" };
  }

  const shop = await prisma.shop.findUnique({
    where: { id: session.shopId },
    select: { planType: true },
  });

  if (shop?.planType !== "premium") {
    return { error: "Fonctionnalite Premium requise" };
  }

  return { shopId: session.shopId };
}

// OCR parsing happens client-side with Tesseract.js
// This action saves the parsed results and optionally applies them to stock

export async function saveScan(
  type: "facture" | "ticket",
  rawText: string,
  parsedItems: ParsedItem[],
): Promise<ActionResult> {
  const auth = await getAuthorizedShopId();
  if ("error" in auth) return { error: auth.error };

  if (!rawText || rawText.trim().length === 0) {
    return { error: "Texte OCR vide" };
  }

  if (!parsedItems || parsedItems.length === 0) {
    return { error: "Aucun produit detecte" };
  }

  // We store scan data as a JSON object in an analytics event for now
  // A dedicated scans table could be added later
  const scanEvent = await prisma.analyticsEvent.create({
    data: {
      eventType: "ocr_scan",
      targetType: type,
      targetName: `Scan ${type} - ${parsedItems.length} produits`,
      extra: {
        rawText: rawText.slice(0, 5000),
        parsedItems,
        applied: false,
      },
    },
  });

  return { success: true, id: scanEvent.id };
}

export async function applyScan(scanId: number): Promise<ActionResult> {
  const auth = await getAuthorizedShopId();
  if ("error" in auth) return { error: auth.error };
  const { shopId } = auth;

  const scan = await prisma.analyticsEvent.findUnique({
    where: { id: scanId },
    select: { extra: true, eventType: true },
  });

  if (!scan || scan.eventType !== "ocr_scan") {
    return { error: "Scan non trouve" };
  }

  const scanData = scan.extra as { parsedItems: ParsedItem[]; applied: boolean } | null;
  if (!scanData) {
    return { error: "Donnees de scan invalides" };
  }

  if (scanData.applied) {
    return { error: "Ce scan a deja ete applique" };
  }

  // Apply each parsed item to stock
  for (const item of scanData.parsedItems) {
    if (item.matchedProductId) {
      // Update existing product quantity
      const product = await prisma.product.findUnique({
        where: { id: item.matchedProductId },
        select: { shopId: true, quantity: true },
      });

      if (product?.shopId === shopId) {
        await prisma.product.update({
          where: { id: item.matchedProductId },
          data: {
            quantity: product.quantity + item.quantity,
            price: item.price ?? undefined,
            lastUpdated: new Date(),
          },
        });
      }
    } else {
      // Create new stock product
      await prisma.product.create({
        data: {
          shopId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        },
      });
    }
  }

  // Mark scan as applied
  await prisma.analyticsEvent.update({
    where: { id: scanId },
    data: {
      extra: { ...scanData, applied: true },
    },
  });

  revalidatePath("/stock");
  revalidatePath("/scanner");
  return { success: true };
}
