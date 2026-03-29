import { describe, it, expect } from "vitest";
import { verifyShopSchema, cityAccountSchema } from "../admin";

describe("verifyShopSchema", () => {
  it("accepts verified status", () => {
    const result = verifyShopSchema.safeParse({ status: "verified" });
    expect(result.success).toBe(true);
  });

  it("accepts rejected with reason", () => {
    const result = verifyShopSchema.safeParse({
      status: "rejected",
      reason: "Documents illegibles",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = verifyShopSchema.safeParse({ status: "pending" });
    expect(result.success).toBe(false);
  });

  it("rejects too long reason", () => {
    const result = verifyShopSchema.safeParse({
      status: "rejected",
      reason: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe("cityAccountSchema", () => {
  it("accepts valid city account", () => {
    const result = cityAccountSchema.safeParse({
      name: "Lyon",
      email: "mairie@lyon.fr",
      department: "69",
      region: "Auvergne-Rhone-Alpes",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = cityAccountSchema.safeParse({
      name: "",
      email: "mairie@lyon.fr",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = cityAccountSchema.safeParse({
      name: "Lyon",
      email: "not-email",
    });
    expect(result.success).toBe(false);
  });

  it("accepts minimal data", () => {
    const result = cityAccountSchema.safeParse({
      name: "Paris",
      email: "admin@paris.fr",
    });
    expect(result.success).toBe(true);
  });
});
