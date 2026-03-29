"use client";

import { useState, useMemo } from "react";
import { PillGroup } from "@/components/ui/PillGroup";
import { ActivityCard } from "@/components/cards/ActivityCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PrivateCodeSheet } from "@/components/sheets/PrivateCodeSheet";
import Link from "next/link";

interface ActivityData {
  id: number;
  name: string;
  category: string | null;
  mainImage: string | null;
  priceInfo: string | null;
  shopName: string;
  isPrivate: boolean;
  folderCode: string | null;
}

interface CityData {
  id: number;
  name: string | null;
  department: string | null;
  logoEmoji: string | null;
}

interface Props {
  activities: ActivityData[];
  cities: CityData[];
}

const CATEGORIES = [
  "Tous",
  "Loisirs",
  "Sport",
  "Bien-etre",
  "Culture",
  "Nature",
  "Gastronomie",
];

export function ActivitiesPageClient({ activities, cities }: Props) {
  const [category, setCategory] = useState("Tous");
  const [showPrivateSheet, setShowPrivateSheet] = useState(false);
  const [unlockedCodes, setUnlockedCodes] = useState<Set<string>>(new Set());

  const publicActivities = useMemo(
    () => activities.filter((a) => !a.isPrivate),
    [activities],
  );

  const filtered = useMemo(() => {
    return publicActivities.filter((a) => {
      if (category === "Tous") return true;
      return a.category?.toLowerCase() === category.toLowerCase();
    });
  }, [publicActivities, category]);

  const unlockedPrivate = activities.filter(
    (a) => a.isPrivate && a.folderCode && unlockedCodes.has(a.folderCode),
  );

  return (
    <div className="px-4 md:px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-serif font-semibold text-[1.8rem] text-text">
          🎯 Activites
        </h1>
        <button
          onClick={() => setShowPrivateSheet(true)}
          className="px-3 py-2 rounded-button border-[1.5px] border-border text-sm font-medium text-text2 hover:border-terra hover:text-terra transition-colors"
        >
          🔐 Code dossier
        </button>
      </div>

      <PillGroup
        options={CATEGORIES}
        value={category}
        onChange={setCategory}
        className="mb-6"
      />

      {/* Villes */}
      {cities.length > 0 && (
        <section className="mb-8">
          <h2 className="font-serif font-semibold text-[1.15rem] text-text mb-3">
            Decouvrir les villes
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {cities.map((city) => (
              <Link
                key={city.id}
                href={`/villes/${city.id}`}
                className="shrink-0 w-40 p-3 bg-white rounded-card border-[1.5px] border-border hover:shadow-md transition-all text-center"
              >
                <span className="text-2xl">
                  {city.logoEmoji || "🏙️"}
                </span>
                <p className="font-semibold text-sm text-text mt-1">
                  {city.name ?? "Ville"}
                </p>
                {city.department && (
                  <p className="text-[0.7rem] text-text3">{city.department}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Activites */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filtered.map((a) => (
          <ActivityCard key={a.id} {...a} />
        ))}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon="🎯"
          title="Aucune activite"
          description="Aucune activite ne correspond a vos criteres"
        />
      )}

      {unlockedPrivate.length > 0 && (
        <section className="mt-8">
          <h2 className="font-serif font-semibold text-[1.15rem] text-purple mb-3">
            🔐 Activites privees ({unlockedPrivate.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {unlockedPrivate.map((a) => (
              <ActivityCard key={a.id} {...a} />
            ))}
          </div>
        </section>
      )}

      <PrivateCodeSheet
        open={showPrivateSheet}
        onClose={() => setShowPrivateSheet(false)}
        onSubmit={(code) => {
          setUnlockedCodes((prev) => new Set(prev).add(code));
          setShowPrivateSheet(false);
        }}
      />
    </div>
  );
}
