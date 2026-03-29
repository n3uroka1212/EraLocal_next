import type { SessionPayload } from "./session";

export const PERMISSIONS = [
  "stock_view",
  "stock_edit",
  "scan_facture",
  "scan_ticket",
  "alerts_view",
  "settings_view",
  "employees_manage",
  "shop_edit",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export function checkPermission(
  session: SessionPayload,
  permission: Permission,
): boolean {
  // Owner has all permissions implicitly
  if (isOwner(session)) return true;

  return session.permissions?.[permission] === true;
}

export function isOwner(session: SessionPayload): boolean {
  return session.userType === "merchant" && !session.permissions;
}

export function isAdmin(session: SessionPayload): boolean {
  return session.userType === "admin";
}

export function requirePermission(
  session: SessionPayload,
  permission: Permission,
): void {
  if (!checkPermission(session, permission)) {
    throw new PermissionError(
      `Permission refusee : ${permission}`,
    );
  }
}

export class PermissionError extends Error {
  public readonly statusCode = 403;

  constructor(message: string) {
    super(message);
    this.name = "PermissionError";
  }
}
