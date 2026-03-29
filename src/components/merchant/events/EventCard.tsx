"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { PrivateCodeDisplay } from "./PrivateCodeDisplay";

const EVENT_TYPE_CONFIG: Record<string, { label: string; bgClass: string; textClass: string }> = {
  marche: {
    label: "Marche",
    bgClass: "bg-[#2A4A35]/15",
    textClass: "text-[#7BC68F]",
  },
  degustation: {
    label: "Degustation",
    bgClass: "bg-[#4A2A3A]/15",
    textClass: "text-[#E090B0]",
  },
  atelier: {
    label: "Atelier",
    bgClass: "bg-[#2A3A4A]/15",
    textClass: "text-[#70A0D0]",
  },
  autre: {
    label: "Autre",
    bgClass: "bg-bg3",
    textClass: "text-text2",
  },
};

function formatDateFr(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export interface EventItem {
  id: number;
  title: string;
  description: string | null;
  eventType: string | null;
  eventDate: string | null;
  eventTime: string | null;
  endTime: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  isRecurring: boolean;
  recurringDay: string | null;
  recurringDays: string | null;
  active: boolean;
  isPrivate: boolean;
  privateCode: string | null;
  createdAt: string;
}

interface EventCardProps {
  event: EventItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: (active: boolean) => void;
  isPending: boolean;
}

export function EventCard({
  event,
  onEdit,
  onDelete,
  onToggleActive,
  isPending,
}: EventCardProps) {
  const typeConfig = event.eventType
    ? EVENT_TYPE_CONFIG[event.eventType] ?? EVENT_TYPE_CONFIG.autre
    : null;

  const formattedDate = formatDateFr(event.eventDate);
  const timeRange =
    event.eventTime && event.endTime
      ? `${event.eventTime} - ${event.endTime}`
      : event.eventTime ?? "";

  return (
    <div
      className={`bg-bg2 border border-border rounded-card p-4 space-y-3 transition-opacity ${
        !event.active ? "opacity-60" : ""
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold font-serif text-text truncate">
            {event.title}
          </h3>
          {event.description && (
            <p className="text-sm text-text2 mt-1 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>
        <Toggle
          checked={event.active}
          onChange={onToggleActive}
          disabled={isPending}
        />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        {typeConfig && (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-input text-[0.75rem] font-medium ${typeConfig.bgClass} ${typeConfig.textClass}`}
          >
            {typeConfig.label}
          </span>
        )}
        {event.isPrivate && (
          <Badge variant="purple">Prive</Badge>
        )}
        {event.isRecurring && (
          <Badge variant="cyan">Recurrent</Badge>
        )}
        {!event.active && (
          <Badge variant="red">Inactif</Badge>
        )}
      </div>

      {/* Date and time */}
      {(formattedDate || timeRange) && (
        <div className="flex items-center gap-2 text-sm text-text2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <span className="capitalize">{formattedDate}</span>
          {timeRange && (
            <>
              <span className="text-text3">|</span>
              <span>{timeRange}</span>
            </>
          )}
        </div>
      )}

      {/* Address */}
      {event.address && (
        <div className="flex items-center gap-2 text-sm text-text2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <span>{event.address}</span>
        </div>
      )}

      {/* Private code */}
      {event.isPrivate && event.privateCode && (
        <div className="pt-1">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.5px] text-text2 mb-1.5">
            Code d&apos;acces
          </p>
          <PrivateCodeDisplay eventId={event.id} code={event.privateCode} />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-border">
        <Button variant="ghost" size="sm" onClick={onEdit} disabled={isPending}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          Modifier
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete} disabled={isPending} className="text-red hover:text-red">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
          Supprimer
        </Button>
      </div>
    </div>
  );
}
