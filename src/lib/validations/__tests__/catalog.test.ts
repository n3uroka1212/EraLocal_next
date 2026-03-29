import { describe, it, expect } from "vitest";
import {
  catalogProductSchema,
  catalogVariantSchema,
  reorderSchema,
} from "../catalog";

describe("catalogProductSchema", () => {
  it("accepts valid product data", () => {
    const result = catalogProductSchema.safeParse({
      name: "Pain complet",
      description: "Un pain bio",
      price: 3.5,
      priceUnit: "piece",
      category: "Pain",
      available: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = catalogProductSchema.safeParse({
      name: "",
      price: 3.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative price", () => {
    const result = catalogProductSchema.safeParse({
      name: "Pain",
      price: -1,
    });
    expect(result.success).toBe(false);
  });

  it("accepts zero price", () => {
    const result = catalogProductSchema.safeParse({
      name: "Echantillon gratuit",
      price: 0,
    });
    expect(result.success).toBe(true);
  });

  it("accepts without optional fields", () => {
    const result = catalogProductSchema.safeParse({
      name: "Pain",
    });
    expect(result.success).toBe(true);
  });

  it("coerces string price to number", () => {
    const result = catalogProductSchema.safeParse({
      name: "Pain",
      price: "3.50",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(3.5);
    }
  });
});

describe("catalogVariantSchema", () => {
  it("accepts valid variant data", () => {
    const result = catalogVariantSchema.safeParse({
      name: "250g",
      price: 5.0,
      available: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty variant name", () => {
    const result = catalogVariantSchema.safeParse({
      name: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("reorderSchema", () => {
  it("accepts valid reorder data", () => {
    const result = reorderSchema.safeParse({
      items: [
        { id: 1, sortOrder: 0 },
        { id: 2, sortOrder: 1 },
        { id: 3, sortOrder: 2 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing id", () => {
    const result = reorderSchema.safeParse({
      items: [{ sortOrder: 0 }],
    });
    expect(result.success).toBe(false);
  });
});
