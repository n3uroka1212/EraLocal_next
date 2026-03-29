"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { getSession } from "@/lib/auth/session";
import { eventSchema } from "@/lib/validations/event";

type ActionResult = {
  error?: string;
  success?: boolean;
  id?: number;
  privateCode?: string;
};

async function getShopId(): Promise<number | null> {
  const session = await getSession();
  if (!session || session.userType !== "merchant" || !session.shopId) {
    return null;
  }
  return session.shopId;
}

async function verifyEventOwnership(
  eventId: number,
  shopId: number,
): Promise<boolean> {
  const event = await prisma.shopEvent.findUnique({
    where: { id: eventId },
    select: { shopId: true },
  });
  return event?.shopId === shopId;
}

function generatePrivateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

export async function createEvent(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    eventType: (formData.get("eventType") as string) || undefined,
    eventDate: formData.get("eventDate")
      ? new Date(formData.get("eventDate") as string)
      : undefined,
    eventTime: (formData.get("eventTime") as string) || undefined,
    endTime: (formData.get("endTime") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    website: (formData.get("website") as string) || undefined,
    isRecurring: formData.get("isRecurring") === "true",
    recurringDay: (formData.get("recurringDay") as string) || undefined,
    recurringDays: (formData.get("recurringDays") as string) || undefined,
    isPrivate: formData.get("isPrivate") === "true",
    active: true,
  };

  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  const privateCode = raw.isPrivate ? generatePrivateCode() : undefined;

  const event = await prisma.shopEvent.create({
    data: {
      shopId,
      ...parsed.data,
      privateCode,
    },
  });

  revalidatePath("/evenements");
  return { success: true, id: event.id, privateCode };
}

export async function updateEvent(
  eventId: number,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  if (!(await verifyEventOwnership(eventId, shopId))) {
    return { error: "Evenement non trouve" };
  }

  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    eventType: (formData.get("eventType") as string) || undefined,
    eventDate: formData.get("eventDate")
      ? new Date(formData.get("eventDate") as string)
      : undefined,
    eventTime: (formData.get("eventTime") as string) || undefined,
    endTime: (formData.get("endTime") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    phone: (formData.get("phone") as string) || undefined,
    website: (formData.get("website") as string) || undefined,
    isRecurring: formData.get("isRecurring") === "true",
    recurringDay: (formData.get("recurringDay") as string) || undefined,
    recurringDays: (formData.get("recurringDays") as string) || undefined,
    isPrivate: formData.get("isPrivate") === "true",
    active: formData.get("active") !== "false",
  };

  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  await prisma.shopEvent.update({
    where: { id: eventId },
    data: parsed.data,
  });

  revalidatePath("/evenements");
  return { success: true };
}

export async function deleteEvent(eventId: number): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  if (!(await verifyEventOwnership(eventId, shopId))) {
    return { error: "Evenement non trouve" };
  }

  await prisma.shopEvent.delete({ where: { id: eventId } });

  revalidatePath("/evenements");
  return { success: true };
}

export async function regenerateEventCode(
  eventId: number,
): Promise<ActionResult> {
  const shopId = await getShopId();
  if (!shopId) return { error: "Non autorise" };

  if (!(await verifyEventOwnership(eventId, shopId))) {
    return { error: "Evenement non trouve" };
  }

  const event = await prisma.shopEvent.findUnique({
    where: { id: eventId },
    select: { isPrivate: true },
  });

  if (!event?.isPrivate) {
    return { error: "L'evenement n'est pas prive" };
  }

  const privateCode = generatePrivateCode();
  await prisma.shopEvent.update({
    where: { id: eventId },
    data: { privateCode },
  });

  revalidatePath("/evenements");
  return { success: true, privateCode };
}
