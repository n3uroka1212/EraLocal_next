import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock NextResponse and NextRequest
vi.mock("next/server", () => {
  const headers = new Map<string, string>();
  return {
    NextResponse: {
      next: vi.fn(({ request: { headers: reqHeaders } } = { request: { headers: new Headers() } }) => ({
        headers: {
          set: (key: string, value: string) => headers.set(key, value),
          get: (key: string) => headers.get(key),
        },
        _mockHeaders: headers,
      })),
    },
    NextRequest: vi.fn(),
  };
});

function createMockRequest(url = "http://localhost:3000/") {
  return {
    headers: new Headers(),
    url,
    nextUrl: new URL(url),
  } as unknown as import("next/server").NextRequest;
}

describe("proxy security headers", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("adds security headers to responses", async () => {
    const { proxy } = await import("./proxy");
    const response = proxy(createMockRequest());

    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(response.headers.get("Content-Security-Policy")).toBeTruthy();
  });

  it("does not set HSTS in development", async () => {
    const { proxy } = await import("./proxy");
    const response = proxy(createMockRequest());

    expect(response.headers.get("Strict-Transport-Security")).toBeUndefined();
  });

  it("includes nonce in CSP header", async () => {
    const { proxy } = await import("./proxy");
    const response = proxy(createMockRequest());
    const csp = response.headers.get("Content-Security-Policy")!;

    expect(csp).toMatch(/nonce-/);
  });
});
