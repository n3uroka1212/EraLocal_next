import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { ConsumerOrderDetailClient } from "@/components/consumer/orders/ConsumerOrderDetailClient";
import { OrderDetailClient } from "@/components/merchant/orders/OrderDetailClient";

interface Params {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Params) {
  const session = await getSession();
  if (!session) {
    redirect("/auth/login");
  }

  const { id } = await params;

  if (session.userType === "consumer") {
    // Consumer accesses orders by orderNumber (string)
    const order = await prisma.order.findUnique({
      where: { orderNumber: id },
      include: {
        shop: {
          select: {
            name: true,
            slug: true,
            logoEmoji: true,
            phone: true,
            ccInstructions: true,
          },
        },
        items: {
          select: {
            id: true,
            productName: true,
            variantName: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
          },
        },
      },
    });

    if (!order || order.clientId !== session.userId) {
      notFound();
    }

    const serialized = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status as
        | "pending"
        | "paid"
        | "preparing"
        | "ready"
        | "collected"
        | "cancelled",
      subtotal: order.subtotal,
      platformFee: order.platformFee,
      total: order.total,
      pickupTime: order.pickupTime?.toISOString() ?? null,
      notes: order.notes,
      cancelReason: order.cancelReason,
      cancelledBy: order.cancelledBy,
      readyAt: order.readyAt?.toISOString() ?? null,
      collectedAt: order.collectedAt?.toISOString() ?? null,
      createdAt: order.createdAt.toISOString(),
      shopName: order.shop.name,
      shopSlug: order.shop.slug,
      shopEmoji: order.shop.logoEmoji,
      shopPhone: order.shop.phone,
      ccInstructions: order.shop.ccInstructions,
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        variantName: item.variantName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
    };

    return <ConsumerOrderDetailClient order={serialized} />;
  }

  if (session.userType === "merchant" && session.shopId) {
    // Merchant accesses orders by numeric id
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) notFound();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        subtotal: true,
        platformFee: true,
        total: true,
        clientName: true,
        clientEmail: true,
        clientPhone: true,
        pickupTime: true,
        notes: true,
        cancelReason: true,
        cancelledBy: true,
        readyAt: true,
        collectedAt: true,
        createdAt: true,
        shopId: true,
        items: {
          select: {
            id: true,
            productName: true,
            variantName: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
          },
        },
      },
    });

    if (!order || order.shopId !== session.shopId) {
      notFound();
    }

    const serialized = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status as "pending" | "paid" | "preparing" | "ready" | "collected" | "cancelled",
      subtotal: order.subtotal,
      platformFee: order.platformFee,
      total: order.total,
      clientName: order.clientName,
      clientEmail: order.clientEmail,
      clientPhone: order.clientPhone,
      pickupTime: order.pickupTime?.toISOString() ?? null,
      notes: order.notes,
      cancelReason: order.cancelReason,
      cancelledBy: order.cancelledBy,
      readyAt: order.readyAt?.toISOString() ?? null,
      collectedAt: order.collectedAt?.toISOString() ?? null,
      createdAt: order.createdAt.toISOString(),
      items: order.items,
    };

    return <OrderDetailClient order={serialized} />;
  }

  redirect("/auth/login");
}
