import { describe, it, expect } from "vitest";
import { activitySchema, folderSchema } from "../activity";

describe("activitySchema", () => {
  it("accepts valid activity data", () => {
    const result = activitySchema.safeParse({
      name: "Randonnee en foret",
      description: "Belle balade nature",
      category: "Sport",
      address: "Foret de Brocéliande",
      priceInfo: "Gratuit",
      duration: "2h",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = activitySchema.safeParse({
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts minimal data (name only)", () => {
    const result = activitySchema.safeParse({
      name: "Yoga",
    });
    expect(result.success).toBe(true);
  });

  it("accepts with folder assignment", () => {
    const result = activitySchema.safeParse({
      name: "Cours de peinture",
      folderId: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts null folderId", () => {
    const result = activitySchema.safeParse({
      name: "Cours de peinture",
      folderId: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid latitude", () => {
    const result = activitySchema.safeParse({
      name: "Test",
      latitude: 200,
    });
    expect(result.success).toBe(false);
  });

  it("rejects too long description", () => {
    const result = activitySchema.safeParse({
      name: "Test",
      description: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

describe("folderSchema", () => {
  it("accepts valid folder data", () => {
    const result = folderSchema.safeParse({
      name: "Activites ete",
      description: "Toutes les activites de l'ete",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = folderSchema.safeParse({
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid 6-char code", () => {
    const result = folderSchema.safeParse({
      name: "Prive",
      code: "ABC123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects code with wrong length", () => {
    const result = folderSchema.safeParse({
      name: "Prive",
      code: "ABC",
    });
    expect(result.success).toBe(false);
  });

  it("rejects code with lowercase", () => {
    const result = folderSchema.safeParse({
      name: "Prive",
      code: "abc123",
    });
    expect(result.success).toBe(false);
  });
});
