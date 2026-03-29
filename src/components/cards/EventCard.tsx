"use client";

import Link from "next/link";
import { CalendarDateBox } from "@/components/ui/CalendarDateBox";
import { Badge } from "@/components/ui/Badge";

interface EventCardProps {
  id: number;
  title: string;
  eventType?: string | null;
  eventDate?: string | Date | null;
  eventTime?: string | null;
  shopName: string;
  isRecurring?: boolean;
}

const typeConfig: Record<string, { emoji: string; variant: "green" | "purple" | "cyan" | "orange" | "red" }> = {
  marche: { emoji: "🛒", variant: "green" },
  degustation: { emoji: "🍷", variant: "purple" },
  atelier: { emoji: "🎨", variant: "cyan" },
  fete: { emoji: "🎉", variant: "orange" },
  "portes ouvertes": { emoji: "🚪", variant: "purple" },
  foire: { emoji: "🎪", variant: "orange" },
  rencontre: { emoji: "🤝", variant: "cyan" },
};

export function EventCard({
  id,
  title,
  eventType,
  eventDate,
  eventTime,
  shopName,
  isRecurring,
}: EventCardProps) {
  const config = typeConfig[eventType?.toLowerCase() ?? ""] ?? {
    emoji: "📅",
    variant: "terra" as const,
  };

  return (
    <Link
      href={`/evenements/${id}`}
      className="flex gap-3 p-3 bg-white rounded-card border-[1.5px] border-border hover:shadow-md transition-all duration-200 animate-[cardFadeIn_0.3s_ease]"
    >
      {eventDate && <CalendarDateBox date={eventDate} />}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {eventType && (
            <Badge variant={config.variant}>
              {config.emoji} {eventType}
            </Badge>
          )}
          {isRecurring && <Badge variant="green">Recurrent</Badge>}
        </div>
        <h3 className="font-serif font-semibold text-[1.05rem] text-text truncate">
          {title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-[0.75rem] text-text2">
          {eventTime && <span>🕐 {eventTime}</span>}
          <span>🏪 {shopName}</span>
        </div>
      </div>
    </Link>
  );
}
