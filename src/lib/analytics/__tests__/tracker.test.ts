import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma
vi.mock("@/lib/db/client", () => ({
  prisma: {
    analyticsEvent: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      deleteMany: vi.fn().mockResolvedValue({ count: 5 }),
    },
  },
}));

import { trackEvent, trackEventAsync, purgeAnalytics } from "../tracker";
import { prisma } from "@/lib/db/client";

describe("tracker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("trackEvent fires and forgets (does not block)", () => {
    // trackEvent should return void immediately
    const result = trackEvent({
      eventType: "page_view",
      targetType: "shop",
      targetId: 1,
    });
    expect(result).toBeUndefined();
    expect(prisma.analyticsEvent.create).toHaveBeenCalledWith({
      data: {
        eventType: "page_view",
        targetType: "shop",
        targetId: 1,
      },
    });
  });

  it("trackEventAsync awaits the create", async () => {
    await trackEventAsync({
      eventType: "search",
      searchQuery: "boulangerie",
    });
    expect(prisma.analyticsEvent.create).toHaveBeenCalledWith({
      data: {
        eventType: "search",
        searchQuery: "boulangerie",
      },
    });
  });

  it("purgeAnalytics deletes old events", async () => {
    const count = await purgeAnalytics(30);
    expect(count).toBe(5);
    expect(prisma.analyticsEvent.deleteMany).toHaveBeenCalledOnce();

    const call = vi.mocked(prisma.analyticsEvent.deleteMany).mock.calls[0][0];
    expect(call?.where?.createdAt?.lt).toBeInstanceOf(Date);
  });

  it("purgeAnalytics defaults to 395 days", async () => {
    await purgeAnalytics();
    const call = vi.mocked(prisma.analyticsEvent.deleteMany).mock.calls[0][0];
    const cutoff = call?.where?.createdAt?.lt as Date;
    const expectedCutoff = new Date(Date.now() - 395 * 24 * 60 * 60 * 1000);
    // Should be within 1 second of expected
    expect(Math.abs(cutoff.getTime() - expectedCutoff.getTime())).toBeLessThan(1000);
  });
});
