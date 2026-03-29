import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { CalendarDateBox } from "@/components/ui/CalendarDateBox";
import { Badge } from "@/components/ui/Badge";
import { ShopContact } from "@/components/shop/ShopContact";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await prisma.shopEvent.findUnique({
    where: { id: Number(id) },
    select: { title: true, description: true },
  });
  if (!event) return { title: "Evenement introuvable" };
  return {
    title: `${event.title} — EraLocal`,
    description: event.description ?? event.title,
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const event = await prisma.shopEvent.findUnique({
    where: { id: Number(id) },
    include: {
      shop: {
        select: {
          name: true,
          slug: true,
          phone: true,
          website: true,
          latitude: true,
          longitude: true,
          verificationStatus: true,
        },
      },
    },
  });

  if (!event || event.shop.verificationStatus !== "verified") notFound();

  return (
    <div className="px-4 md:px-6 py-6">
      <div className="flex gap-4 mb-4">
        {event.eventDate && <CalendarDateBox date={event.eventDate} />}
        <div>
          <h1 className="text-[1.8rem] font-semibold font-serif text-text">
            {event.title}
          </h1>
          {event.eventType && (
            <Badge variant="terra" className="mt-1">
              {event.eventType}
            </Badge>
          )}
        </div>
      </div>

      {event.description && (
        <p className="text-sm text-text2 leading-relaxed mb-4">
          {event.description}
        </p>
      )}

      <div className="space-y-2 mb-6 text-sm">
        {event.eventTime && (
          <p className="text-text">🕐 {event.eventTime}{event.endTime ? ` - ${event.endTime}` : ""}</p>
        )}
        {event.address && <p className="text-text">📍 {event.address}</p>}
        {event.isRecurring && (
          <p className="text-green">🔄 Evenement recurrent{event.recurringDay ? ` — ${event.recurringDay}` : ""}</p>
        )}
        <p className="text-text2">🏪 Organise par {event.shop.name}</p>
      </div>

      <ShopContact
        phone={event.phone ?? event.shop.phone}
        website={event.website ?? event.shop.website}
        latitude={event.shop.latitude}
        longitude={event.shop.longitude}
        address={event.address}
      />
    </div>
  );
}
