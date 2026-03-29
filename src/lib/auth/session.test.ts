import { describe, it, expect, vi, beforeEach } from "vitest";
import { encrypt, decrypt, type SessionPayload } from "./session";

// Mock NEXTAUTH_SECRET
beforeEach(() => {
  vi.stubEnv("NEXTAUTH_SECRET", "test-secret-at-least-16-characters-long");
});

const testPayload: SessionPayload = {
  userId: 1,
  userType: "merchant",
  shopId: 42,
  permissions: { stock_view: true, stock_edit: false },
};

describe("session encryption", () => {
  it("createSession generates a valid encrypted token", () => {
    const token = encrypt(testPayload);
    expect(token).toBeTruthy();
    expect(typeof token).toBe("string");
  });

  it("getSession decodes the payload correctly", () => {
    const token = encrypt(testPayload);
    const decoded = decrypt(token);
    expect(decoded).toEqual(testPayload);
  });

  it("returns null for tampered cookie", () => {
    const token = encrypt(testPayload);
    // Tamper with the token
    const tampered = token.slice(0, -3) + "abc";
    const decoded = decrypt(tampered);
    expect(decoded).toBeNull();
  });

  it("returns null for empty string", () => {
    const decoded = decrypt("");
    expect(decoded).toBeNull();
  });

  it("returns null for garbage data", () => {
    const decoded = decrypt("not-a-valid-token");
    expect(decoded).toBeNull();
  });

  it("produces different tokens for the same payload (unique IV)", () => {
    const token1 = encrypt(testPayload);
    const token2 = encrypt(testPayload);
    expect(token1).not.toBe(token2);
  });

  it("decodes consumer session correctly", () => {
    const consumerPayload: SessionPayload = {
      userId: 99,
      userType: "consumer",
    };
    const token = encrypt(consumerPayload);
    const decoded = decrypt(token);
    expect(decoded).toEqual(consumerPayload);
  });
});
