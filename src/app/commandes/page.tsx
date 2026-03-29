import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { ConsumerOrdersClient } from "@/components/consumer/orders/ConsumerOrdersClient";
import { OrdersManagementClient } from "@/components/merchant/orders/OrdersManagementClient";

export default async function CommandesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/auth/login");
  }

  if (session.userType === "consumer") {
    const orders = await prisma.order.findMany({
      where: { clientId: session.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        pickupTime: true,
        shop: {
          select: {
            name: true,
            slug: true,
            logoEmoji: true,
          },
        },
        items: { select: { id: true } },
      },
    });

    const serialized = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status as
        | "pending"
        | "paid"
        | "preparing"
        | "ready"
        | "collected"
        | "cancelled",
      total: order.total,
      createdAt: order.createdAt.toISOString(),
      pickupTime: order.pickupTime?.toISOString() ?? null,
      shopName: order.shop.name,
      shopSlug: order.shop.slug,
      shopEmoji: order.shop.logoEmoji,
      itemCount: order.items.length,
    }));

    return <ConsumerOrdersClient orders={serialized} />;
  }

  if (session.userType === "merchant" && session.shopId) {
    const orders = await prisma.order.findMany({
      where: { shopId: session.shopId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        clientName: true,
        createdAt: true,
        items: { select: { id: true } },
      },
    });

    const serialized = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status as "pending" | "paid" | "preparing" | "ready" | "collected" | "cancelled",
      total: order.total,
      clientName: order.clientName,
      createdAt: order.createdAt.toISOString(),
      itemCount: order.items.length,
    }));

    return <OrdersManagementClient orders={serialized} />;
  }

  redirect("/auth/login");
}
