import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { stripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe/client";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  // Verify webhook signature
  let event;
  try {
    if (!stripe) {
      // Development mode: parse event directly (no Stripe SDK)
      event = JSON.parse(body);
    } else {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET,
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Handle payment events
  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        await prisma.order.update({
          where: { id: parseInt(orderId, 10) },
          data: {
            status: "paid",
            paymentStatus: "succeeded",
            stripeChargeId: paymentIntent.latest_charge as string,
          },
        });

        // Notify consumer
        const order = await prisma.order.findUnique({
          where: { id: parseInt(orderId, 10) },
          select: { clientId: true, shopId: true, orderNumber: true },
        });

        if (order?.clientId) {
          const shop = await prisma.shop.findUnique({
            where: { id: order.shopId },
            select: { name: true, logo: true, logoEmoji: true },
          });

          await prisma.clientNotification.create({
            data: {
              clientId: order.clientId,
              shopId: order.shopId,
              type: "order_confirmed",
              title: "Commande confirmee",
              message: `Votre commande ${order.orderNumber} a ete confirmee.`,
              targetId: parseInt(orderId, 10),
              shopName: shop?.name,
              shopLogo: shop?.logo ?? shop?.logoEmoji,
            },
          });
        }
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        await prisma.order.update({
          where: { id: parseInt(orderId, 10) },
          data: { paymentStatus: "failed" },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
