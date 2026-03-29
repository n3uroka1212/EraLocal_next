import { describe, it, expect } from "vitest";
import {
  loginSchema,
  loginEmailSchema,
  registerMerchantSchema,
  registerClientSchema,
  twoFASchema,
  changePasswordSchema,
  isValidSiret,
} from "./auth";

describe("loginSchema", () => {
  it("accepts valid shop code and PIN", () => {
    const result = loginSchema.safeParse({ shopCode: "SS-AB123", pin: "123456" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid shop code format", () => {
    const result = loginSchema.safeParse({ shopCode: "XX-12345", pin: "123456" });
    expect(result.success).toBe(false);
  });

  it("rejects shop code without SS- prefix", () => {
    const result = loginSchema.safeParse({ shopCode: "AB123", pin: "123456" });
    expect(result.success).toBe(false);
  });

  it("rejects PIN with non-digit characters", () => {
    const result = loginSchema.safeParse({ shopCode: "SS-AB123", pin: "12345a" });
    expect(result.success).toBe(false);
  });

  it("rejects PIN too short", () => {
    const result = loginSchema.safeParse({ shopCode: "SS-AB123", pin: "12345" });
    expect(result.success).toBe(false);
  });
});

describe("loginEmailSchema", () => {
  it("accepts valid email and password", () => {
    const result = loginEmailSchema.safeParse({
      email: "marchand@test.com",
      password: "Password1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email format", () => {
    const result = loginEmailSchema.safeParse({
      email: "not-an-email",
      password: "Password1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password too short", () => {
    const result = loginEmailSchema.safeParse({
      email: "test@test.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerMerchantSchema", () => {
  const validData = {
    name: "Ma Boutique",
    address: "12 rue de la Paix",
    postalCode: "75001",
    city: "Paris",
    siret: "12345678901237",
    phone: "0612345678",
    email: "boutique@test.com",
    password: "Password1",
  };

  it("accepts valid merchant registration data", () => {
    const result = registerMerchantSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects invalid SIRET format", () => {
    const result = registerMerchantSchema.safeParse({ ...validData, siret: "123" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid postal code", () => {
    const result = registerMerchantSchema.safeParse({
      ...validData,
      postalCode: "7500",
    });
    expect(result.success).toBe(false);
  });

  it("rejects weak password", () => {
    const result = registerMerchantSchema.safeParse({
      ...validData,
      password: "password",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid phone number", () => {
    const result = registerMerchantSchema.safeParse({
      ...validData,
      phone: "123",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerClientSchema", () => {
  it("accepts valid client registration", () => {
    const result = registerClientSchema.safeParse({
      email: "client@test.com",
      password: "Password1",
      name: "Jean",
    });
    expect(result.success).toBe(true);
  });

  it("accepts registration without name (optional)", () => {
    const result = registerClientSchema.safeParse({
      email: "client@test.com",
      password: "Password1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = registerClientSchema.safeParse({
      email: "bad-email",
      password: "Password1",
    });
    expect(result.success).toBe(false);
  });
});

describe("twoFASchema", () => {
  it("accepts valid 6-digit code", () => {
    const result = twoFASchema.safeParse({ code: "123456" });
    expect(result.success).toBe(true);
  });

  it("rejects non-digit code", () => {
    const result = twoFASchema.safeParse({ code: "12345a" });
    expect(result.success).toBe(false);
  });

  it("rejects code too short", () => {
    const result = twoFASchema.safeParse({ code: "12345" });
    expect(result.success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  it("accepts valid password change", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "OldPass12",
      newPassword: "NewPass12",
      confirmPassword: "NewPass12",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "OldPass12",
      newPassword: "NewPass12",
      confirmPassword: "Different1",
    });
    expect(result.success).toBe(false);
  });
});

describe("isValidSiret", () => {
  it("validates correct SIRET (Luhn)", () => {
    // Computed valid SIRET: 12345678901237 (Luhn sum = 60)
    expect(isValidSiret("12345678901237")).toBe(true);
  });

  it("rejects invalid SIRET (bad checksum)", () => {
    expect(isValidSiret("12345678901235")).toBe(false);
  });

  it("rejects non-14-digit string", () => {
    expect(isValidSiret("123")).toBe(false);
  });

  it("rejects string with letters", () => {
    expect(isValidSiret("7328293200007A")).toBe(false);
  });
});
