"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const CATEGORY_CONFIG: Record<
  string,
  { label: string; emoji: string; variant: "terra" | "green" | "cyan" | "purple" | "orange" | "default" }
> = {
  monument: { label: "Monument", emoji: "\uD83C\uDFDB\uFE0F", variant: "terra" },
  eglise: { label: "Eglise", emoji: "\u26EA", variant: "purple" },
  parc: { label: "Parc", emoji: "\uD83C\uDF33", variant: "green" },
  musee: { label: "Musee", emoji: "\uD83C\uDFE8", variant: "cyan" },
  chateau: { label: "Chateau", emoji: "\uD83C\uDFF0", variant: "terra" },
  place: { label: "Place", emoji: "\uD83C\uDFDB\uFE0F", variant: "orange" },
  fontaine: { label: "Fontaine", emoji: "\u26F2", variant: "cyan" },
  theatre: { label: "Theatre", emoji: "\uD83C\uDFAD", variant: "purple" },
  bibliotheque: { label: "Bibliotheque", emoji: "\uD83D\uDCDA", variant: "green" },
  marche: { label: "Marche", emoji: "\uD83C\uDFAA", variant: "orange" },
  pont: { label: "Pont", emoji: "\uD83C\uDF09", variant: "cyan" },
  autre: { label: "Autre", emoji: "\uD83D\uDCCD", variant: "default" },
};

export interface CityPointItem {
  id: number;
  name: string;
  description: string | null;
  history: string | null;
  address: string | null;
  category: string | null;
  image: string | null;
  latitude: number | null;
  longitude: number | null;
  sortOrder: number;
  active: boolean;
  createdAt: string;
}

interface CityPointCardProps {
  point: CityPointItem;
  onEdit: () => void;
  onDelete: () => void;
  isPending: boolean;
}

export function CityPointCard({
  point,
  onEdit,
  onDelete,
  isPending,
}: CityPointCardProps) {
  const config = point.category
    ? CATEGORY_CONFIG[point.category] ?? CATEGORY_CONFIG.autre
    : CATEGORY_CONFIG.autre;

  return (
    <div
      className={`bg-bg2 border border-border rounded-card overflow-hidden transition-opacity ${
        !point.active ? "opacity-60" : ""
      }`}
    >
      {/* Image / Placeholder */}
      <div className="relative h-36 bg-bg3">
        {point.image ? (
          <img
            src={point.image}
            alt={point.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {config.emoji}
          </div>
        )}
        {/* Active/Inactive overlay badge */}
        {!point.active && (
          <div className="absolute top-2 right-2">
            <Badge variant="red">Inactif</Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold font-serif text-text truncate">
            {point.name}
          </h3>
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>

        {point.address && (
          <div className="flex items-center gap-1.5 text-sm text-text2">
            <svg
              className="w-3.5 h-3.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
            <span className="truncate">{point.address}</span>
          </div>
        )}

        {point.description && (
          <p className="text-sm text-text2 line-clamp-2">
            {point.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            disabled={isPending}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
            Modifier
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={isPending}
            className="text-red hover:text-red"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  );
}
