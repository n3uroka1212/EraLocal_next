import { describe, it, expect } from "vitest";
import { haversine } from "../haversine";

describe("haversine", () => {
  it("returns 0 for same point", () => {
    expect(haversine(48.8566, 2.3522, 48.8566, 2.3522)).toBe(0);
  });

  it("calculates Paris to Lyon (~392 km)", () => {
    const d = haversine(48.8566, 2.3522, 45.764, 4.8357);
    expect(d).toBeGreaterThan(380);
    expect(d).toBeLessThan(420);
  });

  it("calculates short distance correctly", () => {
    // ~1.1 km between two close points in Paris
    const d = haversine(48.8566, 2.3522, 48.8466, 2.3522);
    expect(d).toBeGreaterThan(1);
    expect(d).toBeLessThan(1.2);
  });
});
