import { levenshtein } from "./fuzzy";

export type MatchType = "exact" | "starts" | "contains" | "fuzzy" | "none";

const SCORES: Record<MatchType, number> = {
  exact: 100,
  starts: 80,
  contains: 60,
  fuzzy: 40,
  none: 0,
};

/**
 * Determine the match type between a query and a target.
 */
export function getMatchType(query: string, target: string): MatchType {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase().trim();

  if (!q) return "none";
  if (t === q) return "exact";
  if (t.startsWith(q)) return "starts";
  if (t.includes(q)) return "contains";

  const maxDistance = q.length >= 4 ? 2 : 1;
  const words = t.split(/\s+/);
  for (const word of words) {
    if (levenshtein(q, word) <= maxDistance) return "fuzzy";
    if (
      word.length >= q.length &&
      levenshtein(q, word.slice(0, q.length)) <= maxDistance
    ) {
      return "fuzzy";
    }
  }

  return "none";
}

/**
 * Score a match: higher = better.
 */
export function scoreMatch(query: string, target: string): number {
  return SCORES[getMatchType(query, target)];
}
