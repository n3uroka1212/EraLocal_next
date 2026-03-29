import { describe, it, expect } from "vitest";
import { cityProfileSchema, cityPointSchema, POINT_CATEGORIES } from "../city";

describe("cityProfileSchema", () => {
  it("accepts valid profile", () => {
    const result = cityProfileSchema.safeParse({
      name: "Lyon",
      description: "Capitale des Gaules",
      department: "69",
      slogan: "Only Lyon",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = cityProfileSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects too long slogan", () => {
    const result = cityProfileSchema.safeParse({
      name: "Lyon",
      slogan: "a".repeat(201),
    });
    expect(result.success).toBe(false);
  });
});

describe("cityPointSchema", () => {
  it("accepts valid point", () => {
    const result = cityPointSchema.safeParse({
      name: "Tour Eiffel",
      description: "Monument emblematique",
      category: "monument",
      address: "Champ de Mars, Paris",
      latitude: 48.8584,
      longitude: 2.2945,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = cityPointSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid category", () => {
    const result = cityPointSchema.safeParse({
      name: "Test",
      category: "invalid_cat",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid categories", () => {
    for (const cat of POINT_CATEGORIES) {
      const result = cityPointSchema.safeParse({
        name: "Test",
        category: cat,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid latitude", () => {
    const result = cityPointSchema.safeParse({
      name: "Test",
      latitude: 200,
    });
    expect(result.success).toBe(false);
  });

  it("accepts minimal data (name only)", () => {
    const result = cityPointSchema.safeParse({ name: "Fontaine" });
    expect(result.success).toBe(true);
  });
});
