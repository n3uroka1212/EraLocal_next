"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { getSession } from "@/lib/auth/session";
import { checkPermission } from "@/lib/auth/permissions";
import { stockProductSchema, adjustQuantitySchema } from "@/lib/validations/stock";

type ActionResult = {
  error?: string;
  success?: boolean;
  id?: number;
};

async function getAuthorizedShopId(
  permission: "stock_view" | "stock_edit" = "stock_edit",
): Promise<{ shopId: number; isPremium: boolean } | { error: string }> {
  const session = await getSession();
  if (!session || session.userType !== "merchant" || !session.shopId) {
    return { error: "Non autorise" };
  }

  if (!checkPermission(session, permission)) {
    return { error: "Permission refusee" };
  }

  const shop = await prisma.shop.findUnique({
    where: { id: session.shopId },
    select: { planType: true },
  });

  if (shop?.planType !== "premium") {
    return { error: "Fonctionnalite Premium requise" };
  }

  return { shopId: session.shopId, isPremium: true };
}

export async function createStockProduct(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const auth = await getAuthorizedShopId();
  if ("error" in auth) return { error: auth.error };
  const { shopId } = auth;

  const raw = {
    name: formData.get("name") as string,
    quantity: formData.get("quantity") ? Number(formData.get("quantity")) : 0,
    unit: (formData.get("unit") as string) || undefined,
    price: formData.get("price") ? Number(formData.get("price")) : undefined,
    category: (formData.get("category") as string) || undefined,
    minStock: formData.get("minStock") ? Number(formData.get("minStock")) : undefined,
    expiryDate: formData.get("expiryDate")
      ? new Date(formData.get("expiryDate") as string)
      : undefined,
    barcode: (formData.get("barcode") as string) || undefined,
    supplier: (formData.get("supplier") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
  };

  const parsed = stockProductSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  const product = await prisma.product.create({
    data: {
      shopId,
      ...parsed.data,
    },
  });

  revalidatePath("/stock");
  return { success: true, id: product.id };
}

export async function updateStockProduct(
  productId: number,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const auth = await getAuthorizedShopId();
  if ("error" in auth) return { error: auth.error };
  const { shopId } = auth;

  const existing = await prisma.product.findUnique({
    where: { id: productId },
    select: { shopId: true },
  });
  if (existing?.shopId !== shopId) {
    return { error: "Produit non trouve" };
  }

  const raw = {
    name: formData.get("name") as string,
    quantity: formData.get("quantity") ? Number(formData.get("quantity")) : 0,
    unit: (formData.get("unit") as string) || undefined,
    price: formData.get("price") ? Number(formData.get("price")) : undefined,
    category: (formData.get("category") as string) || undefined,
    minStock: formData.get("minStock") ? Number(formData.get("minStock")) : undefined,
    expiryDate: formData.get("expiryDate")
      ? new Date(formData.get("expiryDate") as string)
      : undefined,
    barcode: (formData.get("barcode") as string) || undefined,
    supplier: (formData.get("supplier") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
  };

  const parsed = stockProductSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  await prisma.product.update({
    where: { id: productId },
    data: { ...parsed.data, lastUpdated: new Date() },
  });

  revalidatePath("/stock");
  return { success: true };
}

export async function deleteStockProduct(productId: number): Promise<ActionResult> {
  const auth = await getAuthorizedShopId();
  if ("error" in auth) return { error: auth.error };
  const { shopId } = auth;

  const existing = await prisma.product.findUnique({
    where: { id: productId },
    select: { shopId: true },
  });
  if (existing?.shopId !== shopId) {
    return { error: "Produit non trouve" };
  }

  await prisma.product.delete({ where: { id: productId } });

  revalidatePath("/stock");
  return { success: true };
}

export async function adjustQuantity(
  productId: number,
  delta: number,
): Promise<ActionResult> {
  const auth = await getAuthorizedShopId();
  if ("error" in auth) return { error: auth.error };
  const { shopId } = auth;

  const parsed = adjustQuantitySchema.safeParse({ delta });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Quantite invalide" };
  }

  const existing = await prisma.product.findUnique({
    where: { id: productId },
    select: { shopId: true, quantity: true },
  });
  if (existing?.shopId !== shopId) {
    return { error: "Produit non trouve" };
  }

  const newQuantity = existing.quantity + parsed.data.delta;
  if (newQuantity < 0) {
    return { error: "La quantite ne peut pas etre negative" };
  }

  await prisma.product.update({
    where: { id: productId },
    data: { quantity: newQuantity, lastUpdated: new Date() },
  });

  revalidatePath("/stock");
  return { success: true };
}

export async function linkToStock(
  catalogProductId: number,
  stockProductId: number,
): Promise<ActionResult> {
  const auth = await getAuthorizedShopId();
  if ("error" in auth) return { error: auth.error };
  const { shopId } = auth;

  const [catalogProduct, stockProduct] = await Promise.all([
    prisma.catalogProduct.findUnique({
      where: { id: catalogProductId },
      select: { shopId: true },
    }),
    prisma.product.findUnique({
      where: { id: stockProductId },
      select: { shopId: true },
    }),
  ]);

  if (catalogProduct?.shopId !== shopId || stockProduct?.shopId !== shopId) {
    return { error: "Produit non trouve" };
  }

  await prisma.catalogProduct.update({
    where: { id: catalogProductId },
    data: { linkedProductId: stockProductId },
  });

  revalidatePath("/stock");
  revalidatePath("/catalogue");
  return { success: true };
}

export async function unlinkFromStock(
  catalogProductId: number,
): Promise<ActionResult> {
  const auth = await getAuthorizedShopId();
  if ("error" in auth) return { error: auth.error };
  const { shopId } = auth;

  const catalogProduct = await prisma.catalogProduct.findUnique({
    where: { id: catalogProductId },
    select: { shopId: true },
  });
  if (catalogProduct?.shopId !== shopId) {
    return { error: "Produit non trouve" };
  }

  await prisma.catalogProduct.update({
    where: { id: catalogProductId },
    data: { linkedProductId: null },
  });

  revalidatePath("/stock");
  revalidatePath("/catalogue");
  return { success: true };
}
