import { describe, it, expect } from "vitest";
import {
  clientProfileSchema,
  checkoutSchema,
  newsletterSchema,
} from "../client";

describe("clientProfileSchema", () => {
  it("accepts valid profile data", () => {
    const result = clientProfileSchema.safeParse({
      name: "Jean Dupont",
      email: "jean@example.com",
      phone: "0612345678",
      city: "Paris",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty profile (all optional)", () => {
    const result = clientProfileSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = clientProfileSchema.safeParse({
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid phone", () => {
    const result = clientProfileSchema.safeParse({
      phone: "123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts French phone formats", () => {
    expect(clientProfileSchema.safeParse({ phone: "0612345678" }).success).toBe(true);
    expect(clientProfileSchema.safeParse({ phone: "+33612345678" }).success).toBe(true);
  });

  it("rejects short name", () => {
    const result = clientProfileSchema.safeParse({
      name: "J",
    });
    expect(result.success).toBe(false);
  });
});

describe("checkoutSchema", () => {
  it("accepts valid checkout data", () => {
    const result = checkoutSchema.safeParse({
      clientName: "Jean Dupont",
      clientPhone: "0612345678",
      clientEmail: "jean@example.com",
      pickupTime: new Date("2026-04-01T14:00:00"),
      notes: "Merci !",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = checkoutSchema.safeParse({
      clientPhone: "0612345678",
      pickupTime: new Date(),
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing phone", () => {
    const result = checkoutSchema.safeParse({
      clientName: "Jean",
      pickupTime: new Date(),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid phone format", () => {
    const result = checkoutSchema.safeParse({
      clientName: "Jean",
      clientPhone: "12345",
      pickupTime: new Date(),
    });
    expect(result.success).toBe(false);
  });

  it("coerces string date", () => {
    const result = checkoutSchema.safeParse({
      clientName: "Jean",
      clientPhone: "0612345678",
      pickupTime: "2026-04-01T14:00:00",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pickupTime).toBeInstanceOf(Date);
    }
  });

  it("rejects too long notes", () => {
    const result = checkoutSchema.safeParse({
      clientName: "Jean",
      clientPhone: "0612345678",
      pickupTime: new Date(),
      notes: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe("newsletterSchema", () => {
  it("accepts valid email", () => {
    const result = newsletterSchema.safeParse({ email: "test@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = newsletterSchema.safeParse({ email: "not-email" });
    expect(result.success).toBe(false);
  });

  it("rejects empty email", () => {
    const result = newsletterSchema.safeParse({ email: "" });
    expect(result.success).toBe(false);
  });
});
