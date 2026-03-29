import { describe, it, expect } from "vitest";
import { orderStatusSchema, orderCancelSchema, isValidTransition } from "../order";

describe("orderStatusSchema", () => {
  it("accepts valid status", () => {
    const result = orderStatusSchema.safeParse({ status: "paid" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = orderStatusSchema.safeParse({ status: "unknown" });
    expect(result.success).toBe(false);
  });

  it.each(["pending", "paid", "preparing", "ready", "collected", "cancelled"])(
    "accepts status: %s",
    (status) => {
      const result = orderStatusSchema.safeParse({ status });
      expect(result.success).toBe(true);
    },
  );
});

describe("orderCancelSchema", () => {
  it("accepts cancel with reason", () => {
    const result = orderCancelSchema.safeParse({
      reason: "Produit en rupture",
    });
    expect(result.success).toBe(true);
  });

  it("accepts cancel without reason", () => {
    const result = orderCancelSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects too long reason", () => {
    const result = orderCancelSchema.safeParse({
      reason: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe("isValidTransition", () => {
  it("allows pending → paid", () => {
    expect(isValidTransition("pending", "paid")).toBe(true);
  });

  it("allows pending → cancelled", () => {
    expect(isValidTransition("pending", "cancelled")).toBe(true);
  });

  it("allows paid → preparing", () => {
    expect(isValidTransition("paid", "preparing")).toBe(true);
  });

  it("allows paid → cancelled", () => {
    expect(isValidTransition("paid", "cancelled")).toBe(true);
  });

  it("allows preparing → ready", () => {
    expect(isValidTransition("preparing", "ready")).toBe(true);
  });

  it("allows preparing → cancelled", () => {
    expect(isValidTransition("preparing", "cancelled")).toBe(true);
  });

  it("allows ready → collected", () => {
    expect(isValidTransition("ready", "collected")).toBe(true);
  });

  it("rejects pending → ready (skip steps)", () => {
    expect(isValidTransition("pending", "ready")).toBe(false);
  });

  it("rejects pending → preparing (skip steps)", () => {
    expect(isValidTransition("pending", "preparing")).toBe(false);
  });

  it("rejects collected → anything", () => {
    expect(isValidTransition("collected", "cancelled")).toBe(false);
  });

  it("rejects cancelled → anything", () => {
    expect(isValidTransition("cancelled", "pending")).toBe(false);
  });

  it("rejects ready → cancelled", () => {
    expect(isValidTransition("ready", "cancelled")).toBe(false);
  });

  it("rejects unknown status", () => {
    expect(isValidTransition("unknown", "paid")).toBe(false);
  });
});
