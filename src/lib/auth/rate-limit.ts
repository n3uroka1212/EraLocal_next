const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number,
): { allowed: boolean; remainingMs: number } {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remainingMs: 0 };
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, remainingMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, remainingMs: 0 };
}

export function resetRateLimit(key: string): void {
  attempts.delete(key);
}
