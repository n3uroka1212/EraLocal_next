import { describe, it, expect } from "vitest";
import { employeeSchema } from "../employee";

describe("employeeSchema", () => {
  it("accepts valid employee data", () => {
    const result = employeeSchema.safeParse({
      name: "Jean Dupont",
      email: "jean@example.com",
      role: "employee",
      permStockView: true,
      permStockEdit: false,
      permScanFacture: false,
      permScanTicket: false,
      permAlertsView: true,
      permSettingsView: false,
      permEmployeesManage: false,
      permShopEdit: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = employeeSchema.safeParse({
      name: "",
      email: "jean@example.com",
      role: "employee",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = employeeSchema.safeParse({
      name: "Jean Dupont",
      email: "invalid-email",
      role: "employee",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid role", () => {
    const result = employeeSchema.safeParse({
      name: "Jean Dupont",
      email: "jean@example.com",
      role: "admin",
    });
    expect(result.success).toBe(false);
  });

  it("accepts manager role", () => {
    const result = employeeSchema.safeParse({
      name: "Marie Martin",
      email: "marie@example.com",
      role: "manager",
    });
    expect(result.success).toBe(true);
  });

  it("defaults permissions to undefined when not provided", () => {
    const result = employeeSchema.safeParse({
      name: "Jean Dupont",
      email: "jean@example.com",
      role: "employee",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.permStockView).toBeUndefined();
    }
  });
});
