"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { getSession } from "@/lib/auth/session";

type ActionResult = {
  error?: string;
  success?: boolean;
  url?: string;
};

async function getShopId(): Promise<number | null> {
  const session = await getSession();
  if (!session || session.userType !== "merchant" || !session.shopId) {
    return null;
  }
  return session.shopId;
}

export async function initiateStripeOnboarding(): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { email: true, name: true, stripeAccountId: true },
  });

  if (!shop) return { error: "Boutique non trouvee" };

  // In production, this would use the Stripe SDK to create a Connect account
  // and generate an onboarding link
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  //
  // let accountId = shop.stripeAccountId;
  // if (!accountId) {
  //   const account = await stripe.accounts.create({
  //     type: 'express',
  //     email: shop.email,
  //     business_profile: { name: shop.name },
  //   });
  //   accountId = account.id;
  //   await prisma.shop.update({ where: { id: shopId }, data: { stripeAccountId: accountId } });
  // }
  //
  // const accountLink = await stripe.accountLinks.create({
  //   account: accountId,
  //   refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/reglages/stripe`,
  //   return_url: `${process.env.NEXT_PUBLIC_APP_URL}/reglages/stripe?success=true`,
  //   type: 'account_onboarding',
  // });
  //
  // return { success: true, url: accountLink.url };

  // Placeholder: simulate Stripe onboarding
  const mockAccountId = `acct_mock_${shopId}_${Date.now()}`;

  await prisma.shop.update({
    where: { id: shopId },
    data: {
      stripeAccountId: mockAccountId,
      stripeOnboardingComplete: true,
    },
  });

  revalidatePath("/reglages/stripe");
  return { success: true };
}

export async function disconnectStripe(): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { clickCollectEnabled: true },
  });

  if (shop?.clickCollectEnabled) {
    return { error: "Desactivez le Click & Collect avant de deconnecter Stripe" };
  }

  await prisma.shop.update({
    where: { id: shopId },
    data: {
      stripeAccountId: null,
      stripeOnboardingComplete: false,
    },
  });

  revalidatePath("/reglages/stripe");
  return { success: true };
}
