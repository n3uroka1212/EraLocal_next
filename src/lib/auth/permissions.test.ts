import { describe, it, expect } from "vitest";
import {
  checkPermission,
  isOwner,
  isAdmin,
  requirePermission,
  PermissionError,
} from "./permissions";
import type { SessionPayload } from "./session";

const ownerSession: SessionPayload = {
  userId: 1,
  userType: "merchant",
  shopId: 42,
  // No permissions → owner
};

const employeeWithStock: SessionPayload = {
  userId: 2,
  userType: "merchant",
  shopId: 42,
  permissions: {
    stock_view: true,
    stock_edit: false,
    scan_facture: false,
    scan_ticket: false,
    alerts_view: true,
    settings_view: false,
    employees_manage: false,
    shop_edit: false,
  },
};

const adminSession: SessionPayload = {
  userId: 99,
  userType: "admin",
};

const consumerSession: SessionPayload = {
  userId: 50,
  userType: "consumer",
};

describe("checkPermission", () => {
  it("returns true for granted permission", () => {
    expect(checkPermission(employeeWithStock, "stock_view")).toBe(true);
  });

  it("returns false for denied permission", () => {
    expect(checkPermission(employeeWithStock, "stock_edit")).toBe(false);
  });

  it("returns true for owner (all permissions implicit)", () => {
    expect(checkPermission(ownerSession, "stock_edit")).toBe(true);
    expect(checkPermission(ownerSession, "employees_manage")).toBe(true);
  });
});

describe("isOwner", () => {
  it("detects owner (merchant without explicit permissions)", () => {
    expect(isOwner(ownerSession)).toBe(true);
  });

  it("returns false for employee (has permissions object)", () => {
    expect(isOwner(employeeWithStock)).toBe(false);
  });

  it("returns false for non-merchant", () => {
    expect(isOwner(consumerSession)).toBe(false);
  });
});

describe("isAdmin", () => {
  it("detects admin", () => {
    expect(isAdmin(adminSession)).toBe(true);
  });

  it("returns false for non-admin", () => {
    expect(isAdmin(ownerSession)).toBe(false);
  });
});

describe("requirePermission", () => {
  it("does not throw for valid permission", () => {
    expect(() =>
      requirePermission(employeeWithStock, "stock_view"),
    ).not.toThrow();
  });

  it("throws PermissionError for denied permission", () => {
    expect(() =>
      requirePermission(employeeWithStock, "stock_edit"),
    ).toThrow(PermissionError);
  });

  it("does not throw for owner", () => {
    expect(() =>
      requirePermission(ownerSession, "shop_edit"),
    ).not.toThrow();
  });
});
