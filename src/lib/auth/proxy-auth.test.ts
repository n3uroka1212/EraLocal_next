import { describe, it, expect, vi, beforeEach } from "vitest";
import { encrypt } from "./session";
import { checkRouteAuth, decryptSessionToken } from "./proxy-auth";
import type { SessionPayload } from "./session";

beforeEach(() => {
  vi.stubEnv("NEXTAUTH_SECRET", "test-secret-at-least-16-characters-long");
});

const merchantSession: SessionPayload = {
  userId: 1,
  userType: "merchant",
  shopId: 42,
};

const consumerSession: SessionPayload = {
  userId: 2,
  userType: "consumer",
};

describe("checkRouteAuth", () => {
  it("allows public routes without session", () => {
    const result = checkRouteAuth("/", undefined);
    expect(result.needsAuth).toBe(false);
  });

  it("allows auth routes without session", () => {
    const result = checkRouteAuth("/auth/login", undefined);
    expect(result.needsAuth).toBe(false);
  });

  it("redirects to /auth/login for protected merchant route without session", () => {
    const result = checkRouteAuth("/dashboard", undefined);
    expect(result.needsAuth).toBe(true);
    if (result.needsAuth) {
      expect(result.redirectTo).toBe("/auth/login");
    }
  });

  it("redirects to /auth/client/login for consumer routes without session", () => {
    const result = checkRouteAuth("/panier", undefined);
    expect(result.needsAuth).toBe(true);
    if (result.needsAuth) {
      expect(result.redirectTo).toBe("/auth/client/login");
    }
  });

  it("allows merchant on merchant routes with valid session", () => {
    const token = encrypt(merchantSession);
    const result = checkRouteAuth("/dashboard", token);
    expect(result.needsAuth).toBe(false);
    if (!result.needsAuth) {
      expect(result.session?.userType).toBe("merchant");
    }
  });

  it("returns forbidden for consumer accessing merchant routes", () => {
    const token = encrypt(consumerSession);
    const result = checkRouteAuth("/dashboard", token);
    expect(result.needsAuth).toBe(true);
    if (result.needsAuth) {
      expect(result.forbidden).toBe(true);
    }
  });

  it("returns forbidden for merchant accessing admin routes", () => {
    const token = encrypt(merchantSession);
    const result = checkRouteAuth("/admin/boutiques", token);
    expect(result.needsAuth).toBe(true);
    if (result.needsAuth) {
      expect(result.forbidden).toBe(true);
    }
  });

  it("redirects for invalid cookie on protected route", () => {
    const result = checkRouteAuth("/dashboard", "invalid-token");
    expect(result.needsAuth).toBe(true);
    if (result.needsAuth) {
      expect(result.redirectTo).toBe("/auth/login");
    }
  });
});

describe("decryptSessionToken", () => {
  it("decrypts valid token", () => {
    const token = encrypt(merchantSession);
    const decoded = decryptSessionToken(token);
    expect(decoded).toEqual(merchantSession);
  });

  it("returns null for invalid token", () => {
    expect(decryptSessionToken("garbage")).toBeNull();
  });
});
