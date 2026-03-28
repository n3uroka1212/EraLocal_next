import { describe, it, expect } from "vitest";
import { metadata } from "./layout";

describe("Root layout metadata", () => {
  it("contains the expected title", () => {
    expect(metadata.title).toBe("EraLocal — Commerce local");
  });

  it("contains the expected description", () => {
    expect(metadata.description).toContain("commerce local");
  });
});
