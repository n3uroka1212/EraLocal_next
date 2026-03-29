"use client";

import { useState, useMemo } from "react";
import { PillGroup } from "@/components/ui/PillGroup";
import { EventCard } from "@/components/cards/EventCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PrivateCodeSheet } from "@/components/sheets/PrivateCodeSheet";

interface EventData {
  id: number;
  title: string;
  eventType: string | null;
  eventDate: string | null;
  eventTime: string | null;
  shopName: string;
  isRecurring: boolean;
  isPrivate: boolean;
  privateCode: string | null;
  active: boolean;
}

interface EventsPageClientProps {
  events: EventData[];
}

const EVENT_TYPES = [
  "Tous",
  "Marche",
  "Degustation",
  "Atelier",
  "Fete",
  "Portes ouvertes",
];

export function EventsPageClient({ events }: EventsPageClientProps) {
  const [typeFilter, setTypeFilter] = useState("Tous");
  const [showPrivateSheet, setShowPrivateSheet] = useState(false);
  const [unlockedCodes, setUnlockedCodes] = useState<Set<string>>(new Set());

  const now = new Date();

  const publicEvents = useMemo(() => {
    return events.filter((e) => !e.isPrivate && e.active);
  }, [events]);

  const filtered = useMemo(() => {
    return publicEvents.filter((e) => {
      if (typeFilter === "Tous") return true;
      return e.eventType?.toLowerCase() === typeFilter.toLowerCase();
    });
  }, [publicEvents, typeFilter]);

  const current = filtered.filter(
    (e) => e.eventDate && new Date(e.eventDate) <= now,
  );
  const upcoming = filtered.filter(
    (e) => e.eventDate && new Date(e.eventDate) > now,
  );

  const privateEvents = events.filter(
    (e) =>
      e.isPrivate &&
      e.active &&
      e.privateCode &&
      unlockedCodes.has(e.privateCode),
  );

  function handleCodeSubmit(code: string) {
    setUnlockedCodes((prev) => new Set(prev).add(code));
    setShowPrivateSheet(false);
  }

  return (
    <div className="px-4 md:px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-serif font-semibold text-[1.8rem] text-text">
          📅 Evenements
        </h1>
        <button
          onClick={() => setShowPrivateSheet(true)}
          className="px-3 py-2 rounded-button border-[1.5px] border-border text-sm font-medium text-text2 hover:border-terra hover:text-terra transition-colors"
        >
          🔐 Code prive
        </button>
      </div>

      <PillGroup
        options={EVENT_TYPES}
        value={typeFilter}
        onChange={setTypeFilter}
        className="mb-6"
      />

      {/* En cours */}
      {current.length > 0 && (
        <section className="mb-6">
          <h2 className="font-serif font-semibold text-[1.15rem] text-text mb-3">
            En cours ({current.length})
          </h2>
          <div className="space-y-3">
            {current.map((e) => (
              <EventCard key={e.id} {...e} />
            ))}
          </div>
        </section>
      )}

      {/* A venir */}
      {upcoming.length > 0 && (
        <section className="mb-6">
          <h2 className="font-serif font-semibold text-[1.15rem] text-text mb-3">
            A venir ({upcoming.length})
          </h2>
          <div className="space-y-3">
            {upcoming.map((e) => (
              <EventCard key={e.id} {...e} />
            ))}
          </div>
        </section>
      )}

      {filtered.length === 0 && (
        <EmptyState
          icon="📅"
          title="Aucun evenement"
          description="Aucun evenement ne correspond a vos criteres"
        />
      )}

      {/* Evenements prives debloques */}
      {privateEvents.length > 0 && (
        <section className="mb-6">
          <h2 className="font-serif font-semibold text-[1.15rem] text-orange mb-3">
            🔐 Evenements prives ({privateEvents.length})
          </h2>
          <div className="space-y-3">
            {privateEvents.map((e) => (
              <EventCard key={e.id} {...e} />
            ))}
          </div>
        </section>
      )}

      <PrivateCodeSheet
        open={showPrivateSheet}
        onClose={() => setShowPrivateSheet(false)}
        onSubmit={handleCodeSubmit}
      />
    </div>
  );
}
