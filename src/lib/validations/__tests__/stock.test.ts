import { describe, it, expect } from "vitest";
import { stockProductSchema, adjustQuantitySchema } from "../stock";

describe("stockProductSchema", () => {
  it("accepts valid stock product data", () => {
    const result = stockProductSchema.safeParse({
      name: "Farine bio T65",
      quantity: 50,
      unit: "kg",
      price: 2.5,
      category: "Farines",
      minStock: 10,
      barcode: "3760001001234",
      supplier: "Moulin de Provence",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = stockProductSchema.safeParse({
      name: "",
      quantity: 10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative quantity", () => {
    const result = stockProductSchema.safeParse({
      name: "Test",
      quantity: -5,
    });
    expect(result.success).toBe(false);
  });

  it("accepts zero quantity", () => {
    const result = stockProductSchema.safeParse({
      name: "Produit epuise",
      quantity: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative price", () => {
    const result = stockProductSchema.safeParse({
      name: "Test",
      quantity: 10,
      price: -1,
    });
    expect(result.success).toBe(false);
  });

  it("coerces string quantity to number", () => {
    const result = stockProductSchema.safeParse({
      name: "Test",
      quantity: "25",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.quantity).toBe(25);
    }
  });

  it("accepts with expiry date", () => {
    const result = stockProductSchema.safeParse({
      name: "Lait frais",
      quantity: 20,
      expiryDate: "2026-04-15",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.expiryDate).toBeInstanceOf(Date);
    }
  });
});

describe("adjustQuantitySchema", () => {
  it("accepts positive delta", () => {
    const result = adjustQuantitySchema.safeParse({ delta: 5 });
    expect(result.success).toBe(true);
  });

  it("accepts negative delta", () => {
    const result = adjustQuantitySchema.safeParse({ delta: -3 });
    expect(result.success).toBe(true);
  });

  it("accepts zero delta", () => {
    const result = adjustQuantitySchema.safeParse({ delta: 0 });
    expect(result.success).toBe(true);
  });

  it("coerces string to number", () => {
    const result = adjustQuantitySchema.safeParse({ delta: "10" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.delta).toBe(10);
    }
  });
});
