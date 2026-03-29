"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { ActivityItem } from "./ActivitiesManagementClient";

interface ActivityCardProps {
  activity: ActivityItem;
  onEdit: () => void;
  onDelete: () => void;
}

export function ActivityCard({ activity, onEdit, onDelete }: ActivityCardProps) {
  const imageUrl = activity.mainImage ?? (activity.images as string[] | null)?.[0] ?? null;

  return (
    <div className="flex items-center gap-4 bg-bg2 border border-border rounded-card p-4 hover:border-terra/50 transition-colors">
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-button overflow-hidden bg-bg3 flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={activity.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text3 text-xl">
            {"\uD83C\uDFD5\uFE0F"}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-text truncate">
            {activity.name}
          </h4>
          {!activity.active && (
            <Badge variant="red">Inactif</Badge>
          )}
        </div>

        {activity.description && (
          <p className="text-xs text-text3 mt-0.5 line-clamp-1">
            {activity.description}
          </p>
        )}

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {activity.category && (
            <Badge variant="default">{activity.category}</Badge>
          )}
          {activity.priceInfo && (
            <Badge variant="terra">{activity.priceInfo}</Badge>
          )}
          {activity.duration && (
            <Badge variant="cyan">{activity.duration}</Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          Modifier
        </Button>
        <button
          onClick={onDelete}
          className="text-xs text-text3 hover:text-red transition-colors px-2 py-1"
          title="Supprimer"
        >
          &#x2715;
        </button>
      </div>
    </div>
  );
}
