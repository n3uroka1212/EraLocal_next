import { describe, it, expect } from "vitest";
import { getMatchType, scoreMatch } from "../scoring";

describe("getMatchType", () => {
  it("returns exact for identical strings", () => {
    expect(getMatchType("boulangerie", "boulangerie")).toBe("exact");
  });

  it("returns starts for prefix match", () => {
    expect(getMatchType("boulan", "boulangerie")).toBe("starts");
  });

  it("returns contains for substring match", () => {
    expect(getMatchType("anger", "boulangerie")).toBe("contains");
  });

  it("returns fuzzy for typo match", () => {
    expect(getMatchType("boulangrie", "boulangerie")).toBe("fuzzy");
  });

  it("returns none for unrelated", () => {
    expect(getMatchType("pizza", "boulangerie")).toBe("none");
  });
});

describe("scoreMatch", () => {
  it("scores exact > starts > contains > fuzzy", () => {
    const exact = scoreMatch("boulangerie", "boulangerie");
    const starts = scoreMatch("boulan", "boulangerie");
    const contains = scoreMatch("anger", "boulangerie");
    const fuzzy = scoreMatch("boulangrie", "boulangerie");
    const none = scoreMatch("pizza", "boulangerie");

    expect(exact).toBeGreaterThan(starts);
    expect(starts).toBeGreaterThan(contains);
    expect(contains).toBeGreaterThan(fuzzy);
    expect(fuzzy).toBeGreaterThan(none);
    expect(none).toBe(0);
  });
});
