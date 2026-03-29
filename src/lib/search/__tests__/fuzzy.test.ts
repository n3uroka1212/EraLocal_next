import { describe, it, expect } from "vitest";
import { levenshtein, fuzzyMatch } from "../fuzzy";

describe("levenshtein", () => {
  it("returns 0 for identical strings", () => {
    expect(levenshtein("abc", "abc")).toBe(0);
  });

  it("returns length for empty vs non-empty", () => {
    expect(levenshtein("", "abc")).toBe(3);
    expect(levenshtein("abc", "")).toBe(3);
  });

  it("calculates distance correctly", () => {
    expect(levenshtein("kitten", "sitting")).toBe(3);
    expect(levenshtein("boulangerie", "boulangrie")).toBe(1);
  });
});

describe("fuzzyMatch", () => {
  it("matches exact", () => {
    expect(fuzzyMatch("boulangerie", "boulangerie")).toBe(true);
  });

  it("matches with typo: boulangrie -> boulangerie", () => {
    expect(fuzzyMatch("boulangrie", "boulangerie")).toBe(true);
  });

  it("matches starts with", () => {
    expect(fuzzyMatch("boul", "boulangerie martin")).toBe(true);
  });

  it("matches contains", () => {
    expect(fuzzyMatch("martin", "boulangerie martin")).toBe(true);
  });

  it("does not match unrelated", () => {
    expect(fuzzyMatch("pizza", "boulangerie")).toBe(false);
  });

  it("returns false for empty query", () => {
    expect(fuzzyMatch("", "anything")).toBe(false);
  });
});
