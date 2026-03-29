"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { PillGroup } from "@/components/ui/PillGroup";
import { Slider } from "@/components/ui/Slider";
import Link from "next/link";

// Dynamic import to avoid SSR issues with Leaflet
const MapView = dynamic(
  () => import("./MapView").then((mod) => ({ default: mod.MapView })),
  { ssr: false, loading: () => <div className="w-full h-[calc(100vh-200px)] bg-bg3 animate-pulse rounded-card" /> },
);

interface MarkerData {
  id: number;
  lat: number;
  lng: number;
  label: string;
  emoji?: string;
  href?: string;
  type: string;
}

interface MapPageClientProps {
  markers: MarkerData[];
}

const TYPES = ["Tous", "Commercant", "Producteur", "Artisan"];

export function MapPageClient({ markers }: MapPageClientProps) {
  const [typeFilter, setTypeFilter] = useState("Tous");
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(10);
  const [locating, setLocating] = useState(false);

  const typeMap: Record<string, string> = {
    Commercant: "commercant",
    Producteur: "producteur",
    Artisan: "artisan",
  };

  const filtered = useMemo(() => {
    return markers.filter((m) => {
      if (typeFilter !== "Tous" && m.type !== typeMap[typeFilter]) return false;
      return true;
    });
  }, [markers, typeFilter, typeMap]);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
    );
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-var(--nav-h,64px)-64px)]">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-border bg-bg2">
        <Link href="/" className="text-text2 hover:text-text transition-colors text-sm">
          ← Retour
        </Link>
        <h1 className="font-serif font-semibold text-text">Carte</h1>
        <button
          onClick={requestLocation}
          disabled={locating}
          className="px-3 py-1.5 rounded-button border border-border text-sm text-text2 hover:border-terra hover:text-terra transition-colors disabled:opacity-50"
        >
          {locating ? "..." : "📍 Ma position"}
        </button>
      </div>

      {/* Filters */}
      <div className="px-4 py-2 flex items-center gap-4 border-b border-border bg-bg2">
        <PillGroup options={TYPES} value={typeFilter} onChange={setTypeFilter} />
        {userPos && (
          <Slider
            value={radius}
            min={1}
            max={100}
            unit="km"
            label="Rayon"
            onChange={setRadius}
            className="w-40"
          />
        )}
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapView
          markers={filtered}
          userPosition={userPos}
          radiusKm={radius}
        />
      </div>
    </div>
  );
}
