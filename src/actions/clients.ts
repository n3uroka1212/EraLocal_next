"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { getSession, destroySession } from "@/lib/auth/session";
import { clientProfileSchema, newsletterSchema } from "@/lib/validations/client";
import { redirect } from "next/navigation";

type ActionResult = {
  error?: string;
  success?: boolean;
};

export async function updateClientProfile(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.userType !== "consumer") {
    return { error: "Non autorise" };
  }

  const raw = {
    name: (formData.get("name") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    city: (formData.get("city") as string) || undefined,
  };

  const parsed = clientProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  // Check email uniqueness if changed
  if (parsed.data.email) {
    const existingClient = await prisma.client.findUnique({
      where: { email: parsed.data.email },
      select: { id: true },
    });
    if (existingClient && existingClient.id !== session.userId) {
      return { error: "Cet email est deja utilise" };
    }
  }

  await prisma.client.update({
    where: { id: session.userId },
    data: parsed.data,
  });

  revalidatePath("/profil");
  return { success: true };
}

export async function logoutClient(): Promise<void> {
  await destroySession();
  redirect("/");
}

export async function subscribeNewsletter(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    email: formData.get("email") as string,
  };

  const parsed = newsletterSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Email invalide" };
  }

  // Store newsletter subscription as analytics event
  await prisma.analyticsEvent.create({
    data: {
      eventType: "newsletter_subscribe",
      targetName: parsed.data.email,
      extra: { consentDate: new Date().toISOString() },
    },
  });

  return { success: true };
}
