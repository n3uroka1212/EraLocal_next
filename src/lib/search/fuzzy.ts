/**
 * Levenshtein distance between two strings.
 */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0),
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }

  return dp[m][n];
}

/**
 * Check if a query fuzzy-matches a target string.
 * Returns true if the Levenshtein distance is within tolerance.
 */
export function fuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase().trim();

  if (!q) return false;
  if (t === q) return true;
  if (t.startsWith(q) || t.includes(q)) return true;

  // Allow up to 2 typos for queries >= 4 chars, 1 for shorter
  const maxDistance = q.length >= 4 ? 2 : 1;

  // Check each word of the target
  const words = t.split(/\s+/);
  for (const word of words) {
    if (levenshtein(q, word) <= maxDistance) return true;
    // Partial match: compare query against start of word
    if (
      word.length >= q.length &&
      levenshtein(q, word.slice(0, q.length)) <= maxDistance
    ) {
      return true;
    }
  }

  return false;
}
