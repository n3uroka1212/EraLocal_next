import { describe, it, expect } from "vitest";
import { TOTP, Secret } from "otpauth";
import {
  generateTOTPSecret,
  verifyTOTPCode,
  generateTOTPQRCode,
  generateRecoveryCodes,
} from "./totp";

describe("generateTOTPSecret", () => {
  it("generates a base32 secret", () => {
    const secret = generateTOTPSecret();
    expect(secret).toBeTruthy();
    expect(secret.length).toBeGreaterThan(10);
    // Base32 characters
    expect(secret).toMatch(/^[A-Z2-7]+=*$/);
  });
});

describe("verifyTOTPCode", () => {
  it("validates a correct current code", () => {
    const secret = generateTOTPSecret();
    const totp = new TOTP({
      issuer: "EraLocal",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: Secret.fromBase32(secret),
    });
    const code = totp.generate();
    expect(verifyTOTPCode(secret, code)).toBe(true);
  });

  it("rejects an invalid code", () => {
    const secret = generateTOTPSecret();
    expect(verifyTOTPCode(secret, "000000")).toBe(false);
  });

  it("rejects non-numeric code", () => {
    const secret = generateTOTPSecret();
    expect(verifyTOTPCode(secret, "abcdef")).toBe(false);
  });
});

describe("generateTOTPQRCode", () => {
  it("returns a data URI", async () => {
    const secret = generateTOTPSecret();
    const dataUri = await generateTOTPQRCode(secret, "test@shop.com");
    expect(dataUri).toMatch(/^data:image\/png;base64,/);
  });
});

describe("generateRecoveryCodes", () => {
  it("generates 8 codes by default", () => {
    const codes = generateRecoveryCodes();
    expect(codes).toHaveLength(8);
  });

  it("generates codes in XXXX-XXXX format", () => {
    const codes = generateRecoveryCodes();
    for (const code of codes) {
      expect(code).toMatch(/^[A-F0-9]{4}-[A-F0-9]{4}$/);
    }
  });

  it("generates unique codes", () => {
    const codes = generateRecoveryCodes();
    const unique = new Set(codes);
    expect(unique.size).toBe(codes.length);
  });

  it("generates custom count", () => {
    const codes = generateRecoveryCodes(4);
    expect(codes).toHaveLength(4);
  });
});
