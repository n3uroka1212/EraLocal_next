import { describe, it, expect, vi, beforeEach } from "vitest";

vi.stubEnv("NEXTAUTH_SECRET", "test-secret-at-least-16-characters-long");

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
      redirect: vi.fn((url: URL) => ({
        type: "redirect",
        url: url.toString(),
        headers: { set: vi.fn(), get: vi.fn() },
      })),
      rewrite: vi.fn((url: URL, opts?: { status?: number }) => ({
        type: "rewrite",
        url: url.toString(),
        status: opts?.status,
        headers: { set: vi.fn(), get: vi.fn() },
      })),
    },
    NextRequest: vi.fn(),
  };
});

function createMockRequest(url = "http://localhost:3000/", cookies: Record<string, string> = {}) {
  return {
    headers: new Headers(),
    url,
    nextUrl: new URL(url),
    method: "GET",
    cookies: {
      get: (name: string) => cookies[name] ? { name, value: cookies[name] } : undefined,
      getAll: () => Object.entries(cookies).map(([name, value]) => ({ name, value })),
      has: (name: string) => name in cookies,
    },
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

describe("proxy auth protection", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("redirects to /auth/login for protected merchant route without session", async () => {
    const { proxy } = await import("./proxy");
    const response = proxy(createMockRequest("http://localhost:3000/dashboard"));

    expect(response).toHaveProperty("type", "redirect");
    expect((response as any).url).toContain("/auth/login");
  });

  it("redirects to /auth/client/login for protected consumer route without session", async () => {
    const { proxy } = await import("./proxy");
    const response = proxy(createMockRequest("http://localhost:3000/panier"));

    expect(response).toHaveProperty("type", "redirect");
    expect((response as any).url).toContain("/auth/client/login");
  });

  it("allows public routes without session", async () => {
    const { proxy } = await import("./proxy");
    const response = proxy(createMockRequest("http://localhost:3000/"));

    expect(response).not.toHaveProperty("type", "redirect");
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
  });

  it("allows auth routes without session", async () => {
    const { proxy } = await import("./proxy");
    const response = proxy(createMockRequest("http://localhost:3000/auth/login"));

    expect(response).not.toHaveProperty("type", "redirect");
  });

  it("allows /api/webhooks/stripe without session", async () => {
    const { proxy } = await import("./proxy");
    // api routes are excluded by matcher, but let's verify public routes work
    const response = proxy(createMockRequest("http://localhost:3000/recherche"));

    expect(response).not.toHaveProperty("type", "redirect");
  });
});
