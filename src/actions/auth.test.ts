import { describe, it, expect, vi, beforeEach } from "vitest";

vi.stubEnv("NEXTAUTH_SECRET", "test-secret-at-least-16-characters-long");

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
  headers: vi.fn(() => Promise.resolve(new Map([["x-forwarded-for", "127.0.0.1"]]))),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

// Mock Prisma
const mockPrisma = {
  shop: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  client: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  admin: {
    findUnique: vi.fn(),
  },
  cityAccount: {
    findUnique: vi.fn(),
  },
};

vi.mock("@/lib/db/client", () => ({
  prisma: mockPrisma,
}));

// Mock bcrypt
vi.mock("bcrypt", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(() => Promise.resolve("$2b$12$hashedvalue")),
  },
}));

import bcrypt from "bcrypt";
import { resetRateLimit } from "@/lib/auth/rate-limit";

function makeFormData(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(data)) {
    fd.set(k, v);
  }
  return fd;
}

describe("loginMerchant", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    resetRateLimit("login:merchant:127.0.0.1");
  });

  it("rejects invalid shop code format", async () => {
    const { loginMerchant } = await import("./auth");
    const result = await loginMerchant(null, makeFormData({
      shopCode: "INVALID",
      pin: "123456",
    }));
    expect(result.error).toBe("Identifiants invalides");
  });

  it("rejects invalid PIN format", async () => {
    const { loginMerchant } = await import("./auth");
    const result = await loginMerchant(null, makeFormData({
      shopCode: "SS-AB123",
      pin: "12345",
    }));
    expect(result.error).toBe("Identifiants invalides");
  });

  it("returns error for non-existent shop", async () => {
    mockPrisma.shop.findUnique.mockResolvedValue(null);
    const { loginMerchant } = await import("./auth");
    const result = await loginMerchant(null, makeFormData({
      shopCode: "SS-AB123",
      pin: "123456",
    }));
    expect(result.error).toBe("Identifiants invalides");
  });

  it("creates session with correct PIN", async () => {
    mockPrisma.shop.findUnique.mockResolvedValue({
      id: 1,
      ownerPinHash: "$2b$12$hash",
      totpEnabled: false,
    });
    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);

    const { loginMerchant } = await import("./auth");
    const result = await loginMerchant(null, makeFormData({
      shopCode: "SS-AB123",
      pin: "123456",
    }));
    expect(result.success).toBe(true);
    expect(result.redirectTo).toBe("/dashboard");
  });
});

describe("loginMerchantEmail", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    resetRateLimit("login:merchant-email:127.0.0.1");
  });

  it("rejects invalid email format", async () => {
    const { loginMerchantEmail } = await import("./auth");
    const result = await loginMerchantEmail(null, makeFormData({
      email: "not-email",
      password: "Password1",
    }));
    expect(result.error).toBe("Identifiants invalides");
  });

  it("returns error for wrong password", async () => {
    mockPrisma.shop.findUnique.mockResolvedValue({
      id: 1,
      passwordHash: "$2b$12$hash",
      totpEnabled: false,
    });
    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(false);

    const { loginMerchantEmail } = await import("./auth");
    const result = await loginMerchantEmail(null, makeFormData({
      email: "test@test.com",
      password: "WrongPass1",
    }));
    expect(result.error).toBe("Identifiants invalides");
  });

  it("creates session with correct credentials", async () => {
    mockPrisma.shop.findUnique.mockResolvedValue({
      id: 1,
      passwordHash: "$2b$12$hash",
      totpEnabled: false,
    });
    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);

    const { loginMerchantEmail } = await import("./auth");
    const result = await loginMerchantEmail(null, makeFormData({
      email: "test@test.com",
      password: "Password1",
    }));
    expect(result.success).toBe(true);
  });
});

describe("loginClient", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    resetRateLimit("login:client:127.0.0.1");
  });

  it("returns error for non-existent client", async () => {
    mockPrisma.client.findUnique.mockResolvedValue(null);
    const { loginClient } = await import("./auth");
    const result = await loginClient(null, makeFormData({
      email: "client@test.com",
      password: "Password1",
    }));
    expect(result.error).toBe("Identifiants invalides");
  });

  it("creates session with correct credentials", async () => {
    mockPrisma.client.findUnique.mockResolvedValue({
      id: 2,
      passwordHash: "$2b$12$hash",
    });
    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);

    const { loginClient } = await import("./auth");
    const result = await loginClient(null, makeFormData({
      email: "client@test.com",
      password: "Password1",
    }));
    expect(result.success).toBe(true);
  });
});

describe("registerClient", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    resetRateLimit("register:client:127.0.0.1");
  });

  it("creates account with hashed password", async () => {
    mockPrisma.client.findUnique.mockResolvedValue(null);
    mockPrisma.client.create.mockResolvedValue({ id: 10 });

    const { registerClient } = await import("./auth");
    const result = await registerClient(null, makeFormData({
      email: "new@test.com",
      password: "Password1",
      name: "Jean",
    }));
    expect(result.success).toBe(true);
    expect(mockPrisma.client.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "new@test.com",
          passwordHash: "$2b$12$hashedvalue",
        }),
      }),
    );
  });

  it("rejects duplicate email", async () => {
    mockPrisma.client.findUnique.mockResolvedValue({ id: 1 });

    const { registerClient } = await import("./auth");
    const result = await registerClient(null, makeFormData({
      email: "existing@test.com",
      password: "Password1",
    }));
    expect(result.error).toBe("Email deja utilise");
  });
});

describe("loginAdmin", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    resetRateLimit("login:admin:127.0.0.1");
  });

  it("creates session with correct admin credentials", async () => {
    mockPrisma.admin.findUnique.mockResolvedValue({
      id: 99,
      passwordHash: "$2b$12$hash",
    });
    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);

    const { loginAdmin } = await import("./auth");
    const result = await loginAdmin(null, makeFormData({
      email: "admin@test.com",
      password: "AdminPass1",
    }));
    expect(result.success).toBe(true);
    expect(result.redirectTo).toBe("/admin/boutiques");
  });

  it("rejects invalid admin credentials", async () => {
    mockPrisma.admin.findUnique.mockResolvedValue(null);

    const { loginAdmin } = await import("./auth");
    const result = await loginAdmin(null, makeFormData({
      email: "admin@test.com",
      password: "WrongPass1",
    }));
    expect(result.error).toBe("Identifiants invalides");
  });
});

describe("loginCity", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    resetRateLimit("login:city:127.0.0.1");
  });

  it("creates session with correct city credentials", async () => {
    mockPrisma.cityAccount.findUnique.mockResolvedValue({
      id: 5,
      passwordHash: "$2b$12$hash",
    });
    (bcrypt.compare as ReturnType<typeof vi.fn>).mockResolvedValue(true);

    const { loginCity } = await import("./auth");
    const result = await loginCity(null, makeFormData({
      email: "city@test.com",
      password: "CityPass1",
    }));
    expect(result.success).toBe(true);
    expect(result.redirectTo).toBe("/city/profil");
  });
});

describe("rate limiting", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    resetRateLimit("login:merchant:127.0.0.1");
  });

  it("blocks after 5 failed merchant login attempts", async () => {
    mockPrisma.shop.findUnique.mockResolvedValue(null);

    const { loginMerchant } = await import("./auth");
    const fd = makeFormData({ shopCode: "SS-AB123", pin: "123456" });

    for (let i = 0; i < 5; i++) {
      await loginMerchant(null, fd);
    }

    const result = await loginMerchant(null, fd);
    expect(result.error).toContain("Trop de tentatives");
  });
});
