import { prisma } from "@/lib/db/client";
import type { Prisma } from "@/generated/prisma/client";

type TrackEventData = {
  eventType: string;
  targetType?: string;
  targetId?: number;
  targetName?: string;
  searchQuery?: string;
  sessionId?: string;
  clientId?: number;
  userAgent?: string;
  referrer?: string;
  extra?: Prisma.InputJsonValue;
};

/**
 * Fire-and-forget analytics tracking.
 * Does NOT await the database write — returns immediately.
 */
export function trackEvent(data: TrackEventData): void {
  // Fire-and-forget: don't await, don't block rendering
  prisma.analyticsEvent
    .create({ data })
    .catch((err) => {
      console.error("[Analytics] Failed to track event:", err);
    });
}

/**
 * Server-side tracking (awaited).
 */
export async function trackEventAsync(data: TrackEventData): Promise<void> {
  await prisma.analyticsEvent.create({ data });
}

/**
 * Purge analytics events older than N days.
 * RGPD: anonymisation apres 13 mois (CNIL).
 */
export async function purgeAnalytics(keepDays: number = 395): Promise<number> {
  const cutoff = new Date(Date.now() - keepDays * 24 * 60 * 60 * 1000);

  const result = await prisma.analyticsEvent.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  return result.count;
}
