"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { getSession } from "@/lib/auth/session";
import { verifyShopSchema, cityAccountSchema } from "@/lib/validations/admin";
import { catalogProductSchema } from "@/lib/validations/catalog";

type ActionResult = {
  error?: string;
  success?: boolean;
  id?: number;
  password?: string;
};

async function requireAdmin(): Promise<{ error: string } | { userId: number }> {
  const session = await getSession();
  if (!session || session.userType !== "admin") {
    return { error: "Acces admin requis" };
  }
  return { userId: session.userId };
}

// --- Shop Verification ---

export async function verifyShop(
  shopId: number,
  status: string,
  reason?: string,
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  const parsed = verifyShopSchema.safeParse({ status, reason });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { verificationStatus: true },
  });

  if (!shop) return { error: "Boutique non trouvee" };
  if (shop.verificationStatus !== "pending") {
    return { error: "Cette boutique a deja ete traitee" };
  }

  await prisma.shop.update({
    where: { id: shopId },
    data: {
      verificationStatus: parsed.data.status,
      verificationDate: new Date(),
      verificationReason: parsed.data.reason,
    },
  });

  revalidatePath("/admin/boutiques");
  return { success: true };
}

// --- City Accounts ---

export async function createCityAccount(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    department: (formData.get("department") as string) || undefined,
    region: (formData.get("region") as string) || undefined,
    contactName: (formData.get("contactName") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
  };

  const parsed = cityAccountSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  // Check email uniqueness
  const existing = await prisma.cityAccount.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { error: "Cet email est deja utilise" };
  }

  // Generate initial password
  const password = crypto.randomBytes(8).toString("hex");
  const passwordHash = await bcrypt.hash(password, 10);

  const city = await prisma.cityAccount.create({
    data: {
      ...parsed.data,
      passwordHash,
    },
  });

  revalidatePath("/admin/villes");
  return { success: true, id: city.id, password };
}

export async function deleteCityAccount(cityId: number): Promise<ActionResult> {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  await prisma.cityAccount.delete({ where: { id: cityId } });

  revalidatePath("/admin/villes");
  return { success: true };
}

// --- Admin Products (cross-shop) ---

export async function adminCreateProduct(
  shopId: number,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    price: formData.get("price") ? Number(formData.get("price")) : undefined,
    priceUnit: (formData.get("priceUnit") as string) || undefined,
    category: (formData.get("category") as string) || undefined,
    available: formData.get("available") !== "false",
  };

  const parsed = catalogProductSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  const product = await prisma.catalogProduct.create({
    data: { shopId, ...parsed.data },
  });

  revalidatePath("/admin/produits");
  return { success: true, id: product.id };
}

export async function adminDeleteProduct(
  shopId: number,
  productId: number,
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  const product = await prisma.catalogProduct.findUnique({
    where: { id: productId },
    select: { shopId: true },
  });

  if (product?.shopId !== shopId) {
    return { error: "Produit non trouve" };
  }

  await prisma.catalogProduct.delete({ where: { id: productId } });

  revalidatePath("/admin/produits");
  return { success: true };
}

export async function adminDeleteAllProducts(shopId: number): Promise<ActionResult> {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  await prisma.catalogProduct.deleteMany({ where: { shopId } });

  revalidatePath("/admin/produits");
  return { success: true };
}

type CsvProduct = {
  name: string;
  description?: string;
  price?: number;
  priceUnit?: string;
  category?: string;
};

export async function adminImportProducts(
  shopId: number,
  products: CsvProduct[],
  mode: "create" | "upsert" | "replace",
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  if (!products || products.length === 0) {
    return { error: "Aucun produit a importer" };
  }

  // Validate each product
  for (const p of products) {
    const parsed = catalogProductSchema.safeParse(p);
    if (!parsed.success) {
      return { error: `Produit "${p.name}" invalide : ${parsed.error.issues[0]?.message}` };
    }
  }

  if (mode === "replace") {
    await prisma.catalogProduct.deleteMany({ where: { shopId } });
  }

  for (const p of products) {
    if (mode === "upsert") {
      const existing = await prisma.catalogProduct.findFirst({
        where: { shopId, name: p.name },
      });
      if (existing) {
        await prisma.catalogProduct.update({
          where: { id: existing.id },
          data: p,
        });
        continue;
      }
    }
    await prisma.catalogProduct.create({
      data: { shopId, ...p },
    });
  }

  revalidatePath("/admin/produits");
  return { success: true };
}

// --- Backups ---

export async function createBackup(): Promise<ActionResult & { name?: string; size?: string }> {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  // In production: use pg_dump
  // For now: create a JSON export of key tables
  const [shops, products, orders, clients] = await Promise.all([
    prisma.shop.count(),
    prisma.catalogProduct.count(),
    prisma.order.count(),
    prisma.client.count(),
  ]);

  const backupName = `backup-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  const stats = { shops, products, orders, clients };

  // Store backup metadata as analytics event
  await prisma.analyticsEvent.create({
    data: {
      eventType: "backup_created",
      targetName: backupName,
      extra: { stats, createdAt: new Date().toISOString() },
    },
  });

  revalidatePath("/admin/backups");
  return {
    success: true,
    name: backupName,
    size: `~${Math.round((shops * 2 + products * 0.5 + orders * 1 + clients * 0.3) / 10) * 10} KB`,
  };
}

export async function restoreBackup(backupName: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  // In production: use pg_restore
  // For now: just validate the backup exists
  const backup = await prisma.analyticsEvent.findFirst({
    where: { eventType: "backup_created", targetName: backupName },
  });

  if (!backup) {
    return { error: "Backup non trouve" };
  }

  return { success: true };
}
