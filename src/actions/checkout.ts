"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { getSession } from "@/lib/auth/session";
import { checkoutSchema } from "@/lib/validations/client";
import { PLATFORM_FEE_PERCENT } from "@/lib/stripe/client";

type CartItem = {
  productId: number;
  variantId?: number;
  name: string;
  variantName?: string;
  price: number;
  quantity: number;
};

type ActionResult = {
  error?: string;
  success?: boolean;
  orderNumber?: string;
  clientSecret?: string;
};

function generateOrderNumber(): string {
  const rand = crypto.randomInt(100000, 999999);
  return `ERA-${rand}`;
}

export async function createOrder(
  shopId: number,
  items: CartItem[],
  formData: FormData,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.userType !== "consumer") {
    return { error: "Non autorise" };
  }

  // Validate form data
  const raw = {
    clientName: formData.get("clientName") as string,
    clientPhone: formData.get("clientPhone") as string,
    clientEmail: (formData.get("clientEmail") as string) || undefined,
    pickupTime: formData.get("pickupTime") as string,
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  if (!items || items.length === 0) {
    return { error: "Panier vide" };
  }

  // Verify shop exists and has C&C enabled
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: {
      id: true,
      clickCollectEnabled: true,
      ccMinOrder: true,
      stripeAccountId: true,
      stripeOnboardingComplete: true,
      ccCommissionRate: true,
    },
  });

  if (!shop || !shop.clickCollectEnabled) {
    return { error: "Cette boutique n'accepte pas le Click & Collect" };
  }

  // Recalculate prices server-side (never trust client amounts)
  const catalogProducts = await prisma.catalogProduct.findMany({
    where: {
      shopId,
      id: { in: items.map((i) => i.productId) },
      available: true,
    },
    include: { variants: true },
  });

  const orderItems: {
    catalogProductId: number;
    variantId: number | null;
    productName: string;
    variantName: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[] = [];

  for (const item of items) {
    const product = catalogProducts.find((p) => p.id === item.productId);
    if (!product) {
      return { error: `Produit "${item.name}" non disponible` };
    }

    let unitPrice = product.price ?? 0;
    let variantName: string | null = null;

    if (item.variantId) {
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant || !variant.available) {
        return { error: `Variante "${item.variantName}" non disponible` };
      }
      unitPrice = variant.price ?? product.price ?? 0;
      variantName = variant.name;
    }

    orderItems.push({
      catalogProductId: product.id,
      variantId: item.variantId ?? null,
      productName: product.name,
      variantName,
      quantity: item.quantity,
      unitPrice,
      totalPrice: unitPrice * item.quantity,
    });
  }

  const subtotal = orderItems.reduce((sum, i) => sum + i.totalPrice, 0);

  // Check minimum order
  if (shop.ccMinOrder && subtotal < shop.ccMinOrder) {
    return { error: `Commande minimum : ${shop.ccMinOrder.toFixed(2)} €` };
  }

  const commissionRate = shop.ccCommissionRate ?? PLATFORM_FEE_PERCENT;
  const platformFee = Math.round(subtotal * commissionRate) / 100;
  const total = subtotal + platformFee;

  const orderNumber = generateOrderNumber();

  // Create order in database
  const order = await prisma.order.create({
    data: {
      orderNumber,
      shopId,
      clientId: session.userId,
      status: "pending",
      subtotal,
      platformFee,
      total,
      clientName: parsed.data.clientName,
      clientEmail: parsed.data.clientEmail,
      clientPhone: parsed.data.clientPhone,
      pickupTime: parsed.data.pickupTime,
      notes: parsed.data.notes,
      items: {
        create: orderItems,
      },
    },
  });

  // TODO: In production, create Stripe PaymentIntent here
  // const paymentIntent = await stripe.paymentIntents.create({
  //   amount: Math.round(total * 100), // cents
  //   currency: "eur",
  //   transfer_data: { destination: shop.stripeAccountId! },
  //   application_fee_amount: Math.round(platformFee * 100),
  //   metadata: { orderId: order.id.toString(), orderNumber },
  // });
  //
  // await prisma.order.update({
  //   where: { id: order.id },
  //   data: { stripePaymentIntentId: paymentIntent.id },
  // });
  //
  // return { success: true, orderNumber, clientSecret: paymentIntent.client_secret };

  // Mock: directly mark as paid for development
  await prisma.order.update({
    where: { id: order.id },
    data: { status: "paid", paymentStatus: "succeeded" },
  });

  revalidatePath("/commandes");
  return { success: true, orderNumber };
}
