"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { getSession } from "@/lib/auth/session";
import {
  catalogProductSchema,
  catalogVariantSchema,
  reorderSchema,
} from "@/lib/validations/catalog";

type ActionResult = {
  error?: string;
  success?: boolean;
  id?: number;
};

async function getShopId(): Promise<number | null> {
  const session = await getSession();
  if (!session || session.userType !== "merchant" || !session.shopId) {
    return null;
  }
  return session.shopId;
}

async function verifyProductOwnership(
  productId: number,
  shopId: number,
): Promise<boolean> {
  const product = await prisma.catalogProduct.findUnique({
    where: { id: productId },
    select: { shopId: true },
  });
  return product?.shopId === shopId;
}

// --- CRUD Produit catalogue ---

export async function createProduct(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

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

  const maxOrder = await prisma.catalogProduct.aggregate({
    where: { shopId },
    _max: { sortOrder: true },
  });

  const product = await prisma.catalogProduct.create({
    data: {
      shopId,
      ...parsed.data,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath("/catalogue");
  revalidatePath("/vitrine");
  return { success: true, id: product.id };
}

export async function updateProduct(
  productId: number,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  if (!(await verifyProductOwnership(productId, shopId))) {
    return { error: "Acces refuse" };
  }

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

  await prisma.catalogProduct.update({
    where: { id: productId },
    data: parsed.data,
  });

  revalidatePath("/catalogue");
  revalidatePath("/vitrine");
  return { success: true };
}

export async function deleteProduct(productId: number): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  if (!(await verifyProductOwnership(productId, shopId))) {
    return { error: "Acces refuse" };
  }

  await prisma.catalogProduct.delete({ where: { id: productId } });

  revalidatePath("/catalogue");
  revalidatePath("/vitrine");
  return { success: true };
}

export async function toggleProductVisibility(
  productId: number,
): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  if (!(await verifyProductOwnership(productId, shopId))) {
    return { error: "Acces refuse" };
  }

  const product = await prisma.catalogProduct.findUnique({
    where: { id: productId },
    select: { available: true },
  });

  if (!product) return { error: "Produit non trouve" };

  await prisma.catalogProduct.update({
    where: { id: productId },
    data: { available: !product.available },
  });

  revalidatePath("/catalogue");
  revalidatePath("/vitrine");
  return { success: true };
}

// --- Upload photo produit ---

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadProductPhoto(
  productId: number,
  formData: FormData,
): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  if (!(await verifyProductOwnership(productId, shopId))) {
    return { error: "Acces refuse" };
  }

  const file = formData.get("file") as File | null;
  if (!file) return { error: "Aucun fichier" };

  if (file.size > MAX_FILE_SIZE) {
    return { error: "Fichier trop volumineux (max 5MB)" };
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { error: "Type non autorise (JPEG, PNG, WebP)" };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const base64 = Buffer.from(bytes).toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  await prisma.catalogProduct.update({
    where: { id: productId },
    data: { image: dataUri },
  });

  revalidatePath("/catalogue");
  revalidatePath("/vitrine");
  return { success: true };
}

// --- Reorder ---

export async function reorderProducts(
  rawItems: { id: number; sortOrder: number }[],
): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  const parsed = reorderSchema.safeParse({ items: rawItems });
  if (!parsed.success) {
    return { error: "Donnees invalides" };
  }

  const updates = parsed.data.items.map((item) =>
    prisma.catalogProduct.updateMany({
      where: { id: item.id, shopId },
      data: { sortOrder: item.sortOrder },
    }),
  );

  await prisma.$transaction(updates);

  revalidatePath("/catalogue");
  revalidatePath("/vitrine");
  return { success: true };
}

// --- CRUD Variantes ---

export async function createVariant(
  productId: number,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  if (!(await verifyProductOwnership(productId, shopId))) {
    return { error: "Acces refuse" };
  }

  const raw = {
    name: formData.get("name") as string,
    price: formData.get("price") ? Number(formData.get("price")) : undefined,
    available: formData.get("available") !== "false",
  };

  const parsed = catalogVariantSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  const maxOrder = await prisma.catalogVariant.aggregate({
    where: { productId },
    _max: { sortOrder: true },
  });

  const variant = await prisma.catalogVariant.create({
    data: {
      productId,
      ...parsed.data,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath("/catalogue");
  return { success: true, id: variant.id };
}

export async function updateVariant(
  variantId: number,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  const variant = await prisma.catalogVariant.findUnique({
    where: { id: variantId },
    include: { product: { select: { shopId: true } } },
  });

  if (!variant || variant.product.shopId !== shopId) {
    return { error: "Acces refuse" };
  }

  const raw = {
    name: formData.get("name") as string,
    price: formData.get("price") ? Number(formData.get("price")) : undefined,
    available: formData.get("available") !== "false",
  };

  const parsed = catalogVariantSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  await prisma.catalogVariant.update({
    where: { id: variantId },
    data: parsed.data,
  });

  revalidatePath("/catalogue");
  return { success: true };
}

export async function deleteVariant(variantId: number): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  const variant = await prisma.catalogVariant.findUnique({
    where: { id: variantId },
    include: { product: { select: { shopId: true } } },
  });

  if (!variant || variant.product.shopId !== shopId) {
    return { error: "Acces refuse" };
  }

  await prisma.catalogVariant.delete({ where: { id: variantId } });

  revalidatePath("/catalogue");
  return { success: true };
}

// --- Split variantes ---

export async function splitVariants(
  productId: number,
): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  if (!(await verifyProductOwnership(productId, shopId))) {
    return { error: "Acces refuse" };
  }

  const product = await prisma.catalogProduct.findUnique({
    where: { id: productId },
    include: { variants: true },
  });

  if (!product || product.variants.length === 0) {
    return { error: "Pas de variantes a separer" };
  }

  const maxOrder = await prisma.catalogProduct.aggregate({
    where: { shopId },
    _max: { sortOrder: true },
  });

  let nextOrder = (maxOrder._max.sortOrder ?? 0) + 1;

  const creates = product.variants.map((v) => {
    const order = nextOrder++;
    return prisma.catalogProduct.create({
      data: {
        shopId,
        name: `${product.name} — ${v.name}`,
        description: product.description,
        price: v.price ?? product.price,
        priceUnit: product.priceUnit,
        category: product.category,
        image: product.image,
        available: v.available,
        sortOrder: order,
        variantSourceName: product.name,
      },
    });
  });

  await prisma.$transaction([
    ...creates,
    prisma.catalogProduct.delete({ where: { id: productId } }),
  ]);

  revalidatePath("/catalogue");
  revalidatePath("/vitrine");
  return { success: true };
}

// --- Merge variantes ---

export async function mergeVariants(
  productId: number,
): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  const product = await prisma.catalogProduct.findUnique({
    where: { id: productId },
    select: { variantSourceName: true, shopId: true },
  });

  if (!product || product.shopId !== shopId || !product.variantSourceName) {
    return { error: "Produit non eligible au merge" };
  }

  const siblings = await prisma.catalogProduct.findMany({
    where: {
      shopId,
      variantSourceName: product.variantSourceName,
    },
  });

  if (siblings.length < 2) {
    return { error: "Pas assez de produits a fusionner" };
  }

  const parent = await prisma.catalogProduct.create({
    data: {
      shopId,
      name: product.variantSourceName,
      description: siblings[0].description,
      price: siblings[0].price,
      priceUnit: siblings[0].priceUnit,
      category: siblings[0].category,
      image: siblings[0].image,
      available: true,
      sortOrder: siblings[0].sortOrder,
    },
  });

  const variantCreates = siblings.map((s, i) =>
    prisma.catalogVariant.create({
      data: {
        productId: parent.id,
        name: s.name.replace(`${product.variantSourceName} — `, ""),
        price: s.price,
        available: s.available,
        sortOrder: i,
      },
    }),
  );

  const deletes = siblings.map((s) =>
    prisma.catalogProduct.delete({ where: { id: s.id } }),
  );

  await prisma.$transaction([...variantCreates, ...deletes]);

  revalidatePath("/catalogue");
  revalidatePath("/vitrine");
  return { success: true };
}
