import { describe, it, expect } from "vitest";
import { pingResponseSchema } from "../ping";

describe("pingResponseSchema", () => {
  it("accepts 'en_stock' response", () => {
    const result = pingResponseSchema.safeParse({ response: "en_stock" });
    expect(result.success).toBe(true);
  });

  it("accepts 'rupture' response", () => {
    const result = pingResponseSchema.safeParse({ response: "rupture" });
    expect(result.success).toBe(true);
  });

  it("rejects empty response", () => {
    const result = pingResponseSchema.safeParse({ response: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid response", () => {
    const result = pingResponseSchema.safeParse({ response: "maybe" });
    expect(result.success).toBe(false);
  });

  it("rejects missing response", () => {
    const result = pingResponseSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
