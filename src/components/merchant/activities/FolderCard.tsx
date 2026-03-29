"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ActivityCard } from "./ActivityCard";
import type { ActivityItem, FolderItem } from "./ActivitiesManagementClient";

interface FolderCardProps {
  folder: FolderItem;
  activities: ActivityItem[];
  onEditFolder: () => void;
  onDeleteFolder: () => void;
  onEditActivity: (activity: ActivityItem) => void;
  onDeleteActivity: (activity: ActivityItem) => void;
}

export function FolderCard({
  folder,
  activities,
  onEditFolder,
  onDeleteFolder,
  onEditActivity,
  onDeleteActivity,
}: FolderCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-bg2 border border-border rounded-card overflow-hidden">
      {/* Folder header */}
      <div className="flex items-center gap-3 p-4">
        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-7 h-7 flex items-center justify-center rounded-small text-text2 hover:bg-bg3 transition-colors flex-shrink-0"
          aria-label={expanded ? "Replier" : "Deplier"}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Folder icon */}
        <span className="text-xl flex-shrink-0" aria-hidden>
          {expanded ? "\uD83D\uDCC2" : "\uD83D\uDCC1"}
        </span>

        {/* Folder info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-text truncate">
              {folder.name}
            </h3>
            {folder.code && (
              <Badge variant="terra">{folder.code}</Badge>
            )}
            <Badge variant="default">
              {activities.length} activite{activities.length !== 1 ? "s" : ""}
            </Badge>
          </div>
          {folder.description && (
            <p className="text-xs text-text3 mt-0.5 truncate">
              {folder.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={onEditFolder}>
            Modifier
          </Button>
          <button
            onClick={onDeleteFolder}
            className="text-xs text-text3 hover:text-red transition-colors px-2 py-1"
            title="Supprimer le dossier"
          >
            &#x2715;
          </button>
        </div>
      </div>

      {/* Expanded content - activities inside the folder */}
      {expanded && (
        <div className="border-t border-border bg-bg1/50 p-4 space-y-3">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onEdit={() => onEditActivity(activity)}
                onDelete={() => onDeleteActivity(activity)}
              />
            ))
          ) : (
            <p className="text-sm text-text3 text-center py-4">
              Aucune activite dans ce dossier
            </p>
          )}
        </div>
      )}
    </div>
  );
}
