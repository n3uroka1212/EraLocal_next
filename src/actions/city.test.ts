import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetSession, mockPrisma } = vi.hoisted(() => {
  const mockGetSession = vi.fn();
  const mockPrisma = {
    cityAccount: {
      update: vi.fn(),
    },
    cityPoint: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      aggregate: vi.fn(),
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

vi.mock("@/lib/auth/session", () => ({
  getSession: () => mockGetSession(),
}));

vi.mock("@/lib/db/client", () => ({
  prisma: mockPrisma,
}));

import {
  updateCityProfile,
  uploadCityLogo,
  deleteCityLogo,
  uploadCityBanner,
  deleteCityBanner,
  createCityPoint,
  updateCityPoint,
  deleteCityPoint,
  uploadCityPointImage,
} from "./city";

function makeFormData(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(data)) {
    fd.set(k, v);
  }
  return fd;
}

function makeFileFormData(fieldName: string, fileName: string, type: string, sizeKB: number): FormData {
  const fd = new FormData();
  const content = new Uint8Array(sizeKB * 1024);
  const file = new File([content], fileName, { type });
  fd.set(fieldName, file);
  return fd;
}

describe("city actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ userId: 10, userType: "city" });
  });

  // --- Authorization ---

  describe("authorization", () => {
    it("rejects non-city users for updateCityProfile", async () => {
      mockGetSession.mockResolvedValue({ userId: 1, userType: "merchant" });
      const result = await updateCityProfile(null, makeFormData({ name: "Test" }));
      expect(result.error).toBe("Non autorise");
    });

    it("rejects unauthenticated for createCityPoint", async () => {
      mockGetSession.mockResolvedValue(null);
      const result = await createCityPoint(null, makeFormData({ name: "Monument" }));
      expect(result.error).toBe("Non autorise");
    });
  });

  // --- City Profile (S6-T06) ---

  describe("updateCityProfile", () => {
    it("updates city profile", async () => {
      mockPrisma.cityAccount.update.mockResolvedValue({});

      const result = await updateCityProfile(
        null,
        makeFormData({
          name: "Lyon",
          description: "Ville des Lumieres",
          slogan: "Only Lyon",
        }),
      );

      expect(result.success).toBe(true);
      expect(mockPrisma.cityAccount.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: expect.objectContaining({ name: "Lyon" }),
      });
    });

    it("validates name is required", async () => {
      const result = await updateCityProfile(null, makeFormData({ name: "" }));
      expect(result.error).toBeDefined();
    });
  });

  describe("uploadCityLogo", () => {
    it("uploads a valid logo", async () => {
      mockPrisma.cityAccount.update.mockResolvedValue({});

      const fd = makeFileFormData("logo", "logo.png", "image/png", 100);
      const result = await uploadCityLogo(fd);

      expect(result.success).toBe(true);
      expect(mockPrisma.cityAccount.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { logo: expect.stringContaining("data:image/png;base64,") },
      });
    });

    it("rejects oversized logo (>2MB)", async () => {
      const fd = makeFileFormData("logo", "big.png", "image/png", 3000);
      const result = await uploadCityLogo(fd);
      expect(result.error).toContain("trop volumineux");
    });

    it("rejects invalid format", async () => {
      const fd = makeFileFormData("logo", "logo.gif", "image/gif", 100);
      const result = await uploadCityLogo(fd);
      expect(result.error).toContain("Format non supporte");
    });
  });

  describe("deleteCityLogo", () => {
    it("removes city logo", async () => {
      mockPrisma.cityAccount.update.mockResolvedValue({});
      const result = await deleteCityLogo();
      expect(result.success).toBe(true);
      expect(mockPrisma.cityAccount.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { logo: null },
      });
    });
  });

  describe("uploadCityBanner", () => {
    it("uploads a valid banner", async () => {
      mockPrisma.cityAccount.update.mockResolvedValue({});
      const fd = makeFileFormData("banner", "banner.jpg", "image/jpeg", 500);
      const result = await uploadCityBanner(fd);
      expect(result.success).toBe(true);
    });

    it("rejects oversized banner (>5MB)", async () => {
      const fd = makeFileFormData("banner", "big.jpg", "image/jpeg", 6000);
      const result = await uploadCityBanner(fd);
      expect(result.error).toContain("trop volumineux");
    });
  });

  describe("deleteCityBanner", () => {
    it("removes city banner", async () => {
      mockPrisma.cityAccount.update.mockResolvedValue({});
      const result = await deleteCityBanner();
      expect(result.success).toBe(true);
    });
  });

  // --- City Points of Interest (S6-T06) ---

  describe("createCityPoint", () => {
    it("creates a point of interest with auto sort order", async () => {
      mockPrisma.cityPoint.aggregate.mockResolvedValue({ _max: { sortOrder: 2 } });
      mockPrisma.cityPoint.create.mockResolvedValue({ id: 5 });

      const result = await createCityPoint(
        null,
        makeFormData({
          name: "Cathédrale Saint-Jean",
          category: "eglise",
          address: "Place Saint-Jean, Lyon",
        }),
      );

      expect(result.success).toBe(true);
      expect(result.id).toBe(5);
      expect(mockPrisma.cityPoint.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          cityId: 10,
          name: "Cathédrale Saint-Jean",
          sortOrder: 3,
        }),
      });
    });

    it("starts sort order at 0 for first point", async () => {
      mockPrisma.cityPoint.aggregate.mockResolvedValue({ _max: { sortOrder: null } });
      mockPrisma.cityPoint.create.mockResolvedValue({ id: 1 });

      const result = await createCityPoint(null, makeFormData({ name: "Premier Point" }));
      expect(result.success).toBe(true);
      expect(mockPrisma.cityPoint.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ sortOrder: 0 }),
      });
    });

    it("validates name is required", async () => {
      const result = await createCityPoint(null, makeFormData({ name: "" }));
      expect(result.error).toBeDefined();
    });
  });

  describe("updateCityPoint", () => {
    it("updates a point owned by the city", async () => {
      mockPrisma.cityPoint.findUnique.mockResolvedValue({ id: 5, cityId: 10 });
      mockPrisma.cityPoint.update.mockResolvedValue({});

      const result = await updateCityPoint(
        5,
        null,
        makeFormData({ name: "Cathédrale Renovée", category: "monument" }),
      );

      expect(result.success).toBe(true);
    });

    it("rejects update on point from another city", async () => {
      mockPrisma.cityPoint.findUnique.mockResolvedValue({ id: 5, cityId: 999 });

      const result = await updateCityPoint(5, null, makeFormData({ name: "Hack" }));
      expect(result.error).toBe("Point non trouve");
    });
  });

  describe("deleteCityPoint", () => {
    it("deletes a point owned by the city", async () => {
      mockPrisma.cityPoint.findUnique.mockResolvedValue({ id: 5, cityId: 10 });
      mockPrisma.cityPoint.delete.mockResolvedValue({});

      const result = await deleteCityPoint(5);
      expect(result.success).toBe(true);
    });

    it("rejects deletion of point from another city", async () => {
      mockPrisma.cityPoint.findUnique.mockResolvedValue({ id: 5, cityId: 999 });
      const result = await deleteCityPoint(5);
      expect(result.error).toBe("Point non trouve");
    });
  });

  describe("uploadCityPointImage", () => {
    it("uploads image for owned point", async () => {
      mockPrisma.cityPoint.findUnique.mockResolvedValue({ id: 5, cityId: 10 });
      mockPrisma.cityPoint.update.mockResolvedValue({});

      const fd = makeFileFormData("image", "photo.jpg", "image/jpeg", 200);
      const result = await uploadCityPointImage(5, fd);

      expect(result.success).toBe(true);
      expect(mockPrisma.cityPoint.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { image: expect.stringContaining("data:image/jpeg;base64,") },
      });
    });

    it("rejects image for point from another city", async () => {
      mockPrisma.cityPoint.findUnique.mockResolvedValue({ id: 5, cityId: 999 });
      const fd = makeFileFormData("image", "photo.jpg", "image/jpeg", 200);
      const result = await uploadCityPointImage(5, fd);
      expect(result.error).toBe("Point non trouve");
    });
  });
});
