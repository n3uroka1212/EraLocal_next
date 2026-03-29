import { prisma } from "@/lib/db/client";
import { getSession } from "@/lib/auth/session";
import { EventsManagementClient } from "@/components/merchant/events/EventsManagementClient";
import { EventsPageClient } from "@/components/events/EventsPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evenements — EraLocal",
  description: "Decouvrez les evenements locaux : marches, degustations, ateliers et plus",
};

export default async function EvenementsPage() {
  const session = await getSession();

  if (session?.userType === "merchant" && session.shopId) {
    const events = await prisma.shopEvent.findMany({
      where: { shopId: session.shopId },
      orderBy: { createdAt: "desc" },
    });

    return <EventsManagementClient events={JSON.parse(JSON.stringify(events))} />;
  }

  // Public view
  const events = await prisma.shopEvent.findMany({
    where: { active: true },
    include: {
      shop: { select: { name: true, verificationStatus: true } },
    },
    orderBy: { eventDate: "asc" },
  });

  const formattedEvents = events
    .filter((e) => e.shop.verificationStatus === "verified")
    .map((e) => ({
      id: e.id,
      title: e.title,
      eventType: e.eventType,
      eventDate: e.eventDate?.toISOString() ?? null,
      eventTime: e.eventTime,
      shopName: e.shop.name,
      isRecurring: e.isRecurring,
      isPrivate: e.isPrivate,
      privateCode: e.privateCode,
      active: e.active,
    }));

  return <EventsPageClient events={formattedEvents} />;
}
