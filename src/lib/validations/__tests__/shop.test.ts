import { describe, it, expect } from "vitest";
import {
  onboardingSchema,
  shopProfileSchema,
  openingHoursSchema,
} from "../shop";

describe("onboardingSchema", () => {
  it("accepts valid onboarding data", () => {
    const result = onboardingSchema.safeParse({
      businessType: "commercant",
      category: "Boulangerie",
      shopName: "Ma Boulangerie",
      logoEmoji: "🥖",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing businessType", () => {
    const result = onboardingSchema.safeParse({
      businessType: "invalid",
      category: "Boulangerie",
      shopName: "Ma Boulangerie",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty category", () => {
    const result = onboardingSchema.safeParse({
      businessType: "commercant",
      category: "",
      shopName: "Ma Boulangerie",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short shopName", () => {
    const result = onboardingSchema.safeParse({
      businessType: "commercant",
      category: "Boulangerie",
      shopName: "M",
    });
    expect(result.success).toBe(false);
  });

  it("accepts without logoEmoji", () => {
    const result = onboardingSchema.safeParse({
      businessType: "artisan",
      category: "Menuiserie",
      shopName: "Atelier Bois",
    });
    expect(result.success).toBe(true);
  });
});

describe("shopProfileSchema", () => {
  it("accepts valid profile data", () => {
    const result = shopProfileSchema.safeParse({
      name: "Ma Boutique",
      description: "Une belle boutique",
      phone: "0612345678",
      postalCode: "75001",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short name", () => {
    const result = shopProfileSchema.safeParse({
      name: "M",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid phone format", () => {
    const result = shopProfileSchema.safeParse({
      name: "Ma Boutique",
      phone: "123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid postal code", () => {
    const result = shopProfileSchema.safeParse({
      name: "Ma Boutique",
      postalCode: "ABC",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty optional fields", () => {
    const result = shopProfileSchema.safeParse({
      name: "Ma Boutique",
      phone: "",
      postalCode: "",
      website: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("openingHoursSchema", () => {
  it("accepts valid opening hours", () => {
    const hours = Object.fromEntries(
      ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"].map(
        (d) => [d, { open: true, start: "09:00", end: "18:00" }],
      ),
    );
    const result = openingHoursSchema.safeParse(hours);
    expect(result.success).toBe(true);
  });

  it("accepts closed days", () => {
    const hours = Object.fromEntries(
      ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"].map(
        (d) => [d, { open: false }],
      ),
    );
    const result = openingHoursSchema.safeParse(hours);
    expect(result.success).toBe(true);
  });
});
