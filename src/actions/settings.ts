"use server";

import { z } from "zod/v4";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { getSession } from "@/lib/auth/session";

type ActionResult = {
  error?: string;
  success?: boolean;
};

const clickCollectSettingsSchema = z.object({
  clickCollectEnabled: z.boolean(),
  ccPrepTime: z.coerce.number().int().min(1, "Le temps de preparation doit etre > 0").optional(),
  ccInstructions: z.string().max(1000, "Instructions trop longues").optional(),
  ccMinOrder: z.coerce.number().min(0, "Le minimum commande doit etre >= 0").optional(),
});

async function getShopId(): Promise<number | null> {
  const session = await getSession();
  if (!session || session.userType !== "merchant" || !session.shopId) {
    return null;
  }
  return session.shopId;
}

export async function updateClickCollectSettings(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  const raw = {
    clickCollectEnabled: formData.get("clickCollectEnabled") === "true",
    ccPrepTime: formData.get("ccPrepTime")
      ? Number(formData.get("ccPrepTime"))
      : undefined,
    ccInstructions: (formData.get("ccInstructions") as string) || undefined,
    ccMinOrder: formData.get("ccMinOrder")
      ? Number(formData.get("ccMinOrder"))
      : undefined,
  };

  const parsed = clickCollectSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  // Cannot enable C&C without Stripe connected
  if (parsed.data.clickCollectEnabled) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { stripeOnboardingComplete: true },
    });

    if (!shop?.stripeOnboardingComplete) {
      return { error: "Connectez votre compte Stripe avant d'activer le Click & Collect" };
    }
  }

  await prisma.shop.update({
    where: { id: shopId },
    data: parsed.data,
  });

  revalidatePath("/reglages/click-collect");
  return { success: true };
}
