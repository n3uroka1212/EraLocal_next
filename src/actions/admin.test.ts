import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetSession, mockPrisma } = vi.hoisted(() => {
  const mockGetSession = vi.fn();
  const mockPrisma = {
    shop: {
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    cityAccount: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    catalogProduct: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    order: { count: vi.fn() },
    client: { count: vi.fn() },
    analyticsEvent: {
      create: vi.fn(),
      findFirst: vi.fn(),
    },
  };
  return { mockGetSession, mockPrisma };
});

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    }),
  ),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(() => Promise.resolve("$2b$10$hashedpassword")),
  },
}));

vi.mock("@/lib/auth/session", () => ({
  getSession: () => mockGetSession(),
}));

vi.mock("@/lib/db/client", () => ({
  prisma: mockPrisma,
}));

import {
  verifyShop,
  createCityAccount,
  deleteCityAccount,
  adminCreateProduct,
  adminDeleteProduct,
  adminDeleteAllProducts,
  adminImportProducts,
  createBackup,
  restoreBackup,
} from "./admin";

function makeFormData(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(data)) {
    fd.set(k, v);
  }
  return fd;
}

describe("admin actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: authenticated admin
    mockGetSession.mockResolvedValue({ userId: 1, userType: "admin" });
  });

  // --- Authorization ---

  describe("authorization", () => {
    it("rejects non-admin users for verifyShop", async () => {
      mockGetSession.mockResolvedValue({ userId: 1, userType: "merchant" });
      const result = await verifyShop(1, "verified");
      expect(result.error).toBe("Acces admin requis");
    });

    it("rejects unauthenticated users", async () => {
      mockGetSession.mockResolvedValue(null);
      const result = await verifyShop(1, "verified");
      expect(result.error).toBe("Acces admin requis");
    });

    it("rejects non-admin for createCityAccount", async () => {
      mockGetSession.mockResolvedValue({ userId: 1, userType: "consumer" });
      const result = await createCityAccount(
        null,
        makeFormData({ name: "Lyon", email: "lyon@test.fr" }),
      );
      expect(result.error).toBe("Acces admin requis");
    });

    it("rejects non-admin for createBackup", async () => {
      mockGetSession.mockResolvedValue({ userId: 1, userType: "merchant" });
      const result = await createBackup();
      expect(result.error).toBe("Acces admin requis");
    });
  });

  // --- S6-T01: Shop Verification ---

  describe("verifyShop", () => {
    it("approves a pending shop", async () => {
      mockPrisma.shop.findUnique.mockResolvedValue({
        id: 1,
        verificationStatus: "pending",
      });
      mockPrisma.shop.update.mockResolvedValue({});

      const result = await verifyShop(1, "verified");

      expect(result.success).toBe(true);
      expect(mockPrisma.shop.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          verificationStatus: "verified",
          verificationDate: expect.any(Date),
        }),
      });
    });

    it("rejects a shop with reason", async () => {
      mockPrisma.shop.findUnique.mockResolvedValue({
        id: 2,
        verificationStatus: "pending",
      });
      mockPrisma.shop.update.mockResolvedValue({});

      const result = await verifyShop(2, "rejected", "Documents incomplets");

      expect(result.success).toBe(true);
      expect(mockPrisma.shop.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: expect.objectContaining({
          verificationStatus: "rejected",
          verificationReason: "Documents incomplets",
        }),
      });
    });

    it("rejects verification of already processed shop", async () => {
      mockPrisma.shop.findUnique.mockResolvedValue({
        id: 1,
        verificationStatus: "verified",
      });

      const result = await verifyShop(1, "rejected");
      expect(result.error).toBe("Cette boutique a deja ete traitee");
    });

    it("returns error for non-existent shop", async () => {
      mockPrisma.shop.findUnique.mockResolvedValue(null);
      const result = await verifyShop(999, "verified");
      expect(result.error).toBe("Boutique non trouvee");
    });

    it("rejects invalid status", async () => {
      const result = await verifyShop(1, "invalid_status");
      expect(result.error).toBeDefined();
    });
  });

  // --- S6-T02: City Accounts ---

  describe("createCityAccount", () => {
    it("creates a city account and returns initial password", async () => {
      mockPrisma.cityAccount.findUnique.mockResolvedValue(null);
      mockPrisma.cityAccount.create.mockResolvedValue({ id: 10 });

      const result = await createCityAccount(
        null,
        makeFormData({ name: "Lyon", email: "lyon@ville.fr" }),
      );

      expect(result.success).toBe(true);
      expect(result.id).toBe(10);
      expect(result.password).toBeDefined();
      expect(typeof result.password).toBe("string");
      expect(result.password!.length).toBeGreaterThan(0);
    });

    it("rejects duplicate email", async () => {
      mockPrisma.cityAccount.findUnique.mockResolvedValue({ id: 1 });

      const result = await createCityAccount(
        null,
        makeFormData({ name: "Lyon", email: "existing@ville.fr" }),
      );

      expect(result.error).toBe("Cet email est deja utilise");
    });

    it("validates required fields", async () => {
      const result = await createCityAccount(null, makeFormData({ name: "", email: "" }));
      expect(result.error).toBeDefined();
    });
  });

  describe("deleteCityAccount", () => {
    it("deletes a city account", async () => {
      mockPrisma.cityAccount.delete.mockResolvedValue({});
      const result = await deleteCityAccount(5);
      expect(result.success).toBe(true);
      expect(mockPrisma.cityAccount.delete).toHaveBeenCalledWith({ where: { id: 5 } });
    });
  });

  // --- S6-T04: Admin Products ---

  describe("adminCreateProduct", () => {
    it("creates a product for a shop", async () => {
      mockPrisma.catalogProduct.create.mockResolvedValue({ id: 42 });

      const result = await adminCreateProduct(
        1,
        null,
        makeFormData({ name: "Baguette", price: "1.50", category: "Pain" }),
      );

      expect(result.success).toBe(true);
      expect(result.id).toBe(42);
    });
  });

  describe("adminDeleteProduct", () => {
    it("deletes a product belonging to the shop", async () => {
      mockPrisma.catalogProduct.findUnique.mockResolvedValue({ shopId: 1 });
      mockPrisma.catalogProduct.delete.mockResolvedValue({});

      const result = await adminDeleteProduct(1, 42);
      expect(result.success).toBe(true);
    });

    it("rejects if product belongs to different shop", async () => {
      mockPrisma.catalogProduct.findUnique.mockResolvedValue({ shopId: 2 });
      const result = await adminDeleteProduct(1, 42);
      expect(result.error).toBe("Produit non trouve");
    });
  });

  describe("adminDeleteAllProducts", () => {
    it("deletes all products for a shop", async () => {
      mockPrisma.catalogProduct.deleteMany.mockResolvedValue({ count: 5 });
      const result = await adminDeleteAllProducts(1);
      expect(result.success).toBe(true);
      expect(mockPrisma.catalogProduct.deleteMany).toHaveBeenCalledWith({
        where: { shopId: 1 },
      });
    });
  });

  describe("adminImportProducts", () => {
    it("imports products in create mode", async () => {
      mockPrisma.catalogProduct.create.mockResolvedValue({ id: 1 });

      const products = [
        { name: "Croissant", price: 1.2 },
        { name: "Pain", price: 0.9 },
      ];
      const result = await adminImportProducts(1, products, "create");
      expect(result.success).toBe(true);
      expect(mockPrisma.catalogProduct.create).toHaveBeenCalledTimes(2);
    });

    it("imports products in replace mode (deletes first)", async () => {
      mockPrisma.catalogProduct.deleteMany.mockResolvedValue({ count: 3 });
      mockPrisma.catalogProduct.create.mockResolvedValue({ id: 1 });

      const result = await adminImportProducts(1, [{ name: "Nouveau" }], "replace");
      expect(result.success).toBe(true);
      expect(mockPrisma.catalogProduct.deleteMany).toHaveBeenCalledWith({
        where: { shopId: 1 },
      });
    });

    it("imports products in upsert mode", async () => {
      mockPrisma.catalogProduct.findFirst.mockResolvedValueOnce({ id: 10, name: "Existing" });
      mockPrisma.catalogProduct.update.mockResolvedValue({});
      mockPrisma.catalogProduct.findFirst.mockResolvedValueOnce(null);
      mockPrisma.catalogProduct.create.mockResolvedValue({ id: 11 });

      const result = await adminImportProducts(
        1,
        [{ name: "Existing", price: 2 }, { name: "New" }],
        "upsert",
      );
      expect(result.success).toBe(true);
      expect(mockPrisma.catalogProduct.update).toHaveBeenCalledTimes(1);
      expect(mockPrisma.catalogProduct.create).toHaveBeenCalledTimes(1);
    });

    it("rejects empty product list", async () => {
      const result = await adminImportProducts(1, [], "create");
      expect(result.error).toBe("Aucun produit a importer");
    });
  });

  // --- S6-T05: Backups ---

  describe("createBackup", () => {
    it("creates a backup with stats", async () => {
      mockPrisma.shop.count.mockResolvedValue(5);
      mockPrisma.catalogProduct.count.mockResolvedValue(50);
      mockPrisma.order.count.mockResolvedValue(20);
      mockPrisma.client.count.mockResolvedValue(100);
      mockPrisma.analyticsEvent.create.mockResolvedValue({ id: 1 });

      const result = await createBackup();

      expect(result.success).toBe(true);
      expect(result.name).toMatch(/^backup-/);
      expect(result.size).toBeDefined();
      expect(mockPrisma.analyticsEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventType: "backup_created",
          targetName: expect.stringMatching(/^backup-/),
        }),
      });
    });
  });

  describe("restoreBackup", () => {
    it("validates backup exists", async () => {
      mockPrisma.analyticsEvent.findFirst.mockResolvedValue({
        id: 1,
        targetName: "backup-2026-03-29",
      });

      const result = await restoreBackup("backup-2026-03-29");
      expect(result.success).toBe(true);
    });

    it("rejects non-existent backup", async () => {
      mockPrisma.analyticsEvent.findFirst.mockResolvedValue(null);
      const result = await restoreBackup("nonexistent");
      expect(result.error).toBe("Backup non trouve");
    });
  });
});
