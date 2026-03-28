import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateEnv } from "./env";

describe("env validation", () => {
  const validEnv = {
    DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
    JWT_SECRET: "a-long-secret-at-least-16-chars",
    STRIPE_SECRET_KEY: "sk_test_abc123",
    STRIPE_WEBHOOK_SECRET: "whsec_abc123",
    NEXTAUTH_SECRET: "another-long-secret-min-16",
    NEXTAUTH_URL: "http://localhost:3000",
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  };

  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects missing required variables", () => {
    vi.stubEnv("DATABASE_URL", "");
    expect(() => validateEnv()).toThrow();
  });

  it("accepts a complete set of valid variables", () => {
    for (const [key, value] of Object.entries(validEnv)) {
      vi.stubEnv(key, value);
    }
    expect(() => validateEnv()).not.toThrow();
  });
});
