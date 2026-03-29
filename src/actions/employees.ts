"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { getSession } from "@/lib/auth/session";
import { checkPermission } from "@/lib/auth/permissions";
import { employeeSchema } from "@/lib/validations/employee";

type ActionResult = {
  error?: string;
  success?: boolean;
  id?: number;
  pin?: string;
};

async function getAuthorizedShopId(): Promise<{ shopId: number } | { error: string }> {
  const session = await getSession();
  if (!session || session.userType !== "merchant" || !session.shopId) {
    return { error: "Non autorise" };
  }

  if (!checkPermission(session, "employees_manage")) {
    return { error: "Permission refusee" };
  }

  return { shopId: session.shopId };
}

function generatePin(): string {
  const pin = crypto.randomInt(100000, 999999).toString();
  return pin;
}

export async function createEmployee(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const auth = await getAuthorizedShopId();
  if ("error" in auth) return { error: auth.error };
  const { shopId } = auth;

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    role: formData.get("role") as string,
    permStockView: formData.get("permStockView") === "true",
    permStockEdit: formData.get("permStockEdit") === "true",
    permScanFacture: formData.get("permScanFacture") === "true",
    permScanTicket: formData.get("permScanTicket") === "true",
    permAlertsView: formData.get("permAlertsView") === "true",
    permSettingsView: formData.get("permSettingsView") === "true",
    permEmployeesManage: formData.get("permEmployeesManage") === "true",
    permShopEdit: formData.get("permShopEdit") === "true",
  };

  const parsed = employeeSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  const pin = generatePin();
  const pinHash = await bcrypt.hash(pin, 10);
  const passwordHash = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10);

  const employee = await prisma.employee.create({
    data: {
      shopId,
      ...parsed.data,
      pinHash,
      passwordHash,
    },
  });

  revalidatePath("/employes");
  return { success: true, id: employee.id, pin };
}

export async function updateEmployee(
  employeeId: number,
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const auth = await getAuthorizedShopId();
  if ("error" in auth) return { error: auth.error };
  const { shopId } = auth;

  const existing = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { shopId: true },
  });
  if (existing?.shopId !== shopId) {
    return { error: "Employe non trouve" };
  }

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    role: formData.get("role") as string,
    permStockView: formData.get("permStockView") === "true",
    permStockEdit: formData.get("permStockEdit") === "true",
    permScanFacture: formData.get("permScanFacture") === "true",
    permScanTicket: formData.get("permScanTicket") === "true",
    permAlertsView: formData.get("permAlertsView") === "true",
    permSettingsView: formData.get("permSettingsView") === "true",
    permEmployeesManage: formData.get("permEmployeesManage") === "true",
    permShopEdit: formData.get("permShopEdit") === "true",
  };

  const parsed = employeeSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Donnees invalides" };
  }

  await prisma.employee.update({
    where: { id: employeeId },
    data: parsed.data,
  });

  revalidatePath("/employes");
  return { success: true };
}

export async function deleteEmployee(employeeId: number): Promise<ActionResult> {
  const auth = await getAuthorizedShopId();
  if ("error" in auth) return { error: auth.error };
  const { shopId } = auth;

  const existing = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { shopId: true },
  });
  if (existing?.shopId !== shopId) {
    return { error: "Employe non trouve" };
  }

  await prisma.employee.delete({ where: { id: employeeId } });

  revalidatePath("/employes");
  return { success: true };
}

export async function regeneratePin(employeeId: number): Promise<ActionResult> {
  const auth = await getAuthorizedShopId();
  if ("error" in auth) return { error: auth.error };
  const { shopId } = auth;

  const existing = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { shopId: true },
  });
  if (existing?.shopId !== shopId) {
    return { error: "Employe non trouve" };
  }

  const pin = generatePin();
  const pinHash = await bcrypt.hash(pin, 10);

  await prisma.employee.update({
    where: { id: employeeId },
    data: { pinHash },
  });

  revalidatePath("/employes");
  return { success: true, pin };
}
