"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { FolderCard } from "./FolderCard";
import { ActivityCard } from "./ActivityCard";
import { ActivityForm } from "./ActivityForm";
import { FolderForm } from "./FolderForm";
import { deleteActivity, deleteFolder } from "@/actions/activities";

export interface ActivityItem {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  priceInfo: string | null;
  duration: string | null;
  mainImage: string | null;
  images: string[] | null;
  active: boolean;
  sortOrder: number;
  folderId: number | null;
  createdAt: string;
}

export interface FolderItem {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  createdAt: string;
  activities: { id: number }[];
}

interface ActivitiesManagementClientProps {
  activities: ActivityItem[];
  folders: FolderItem[];
}

export function ActivitiesManagementClient({
  activities,
  folders,
}: ActivitiesManagementClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Activity modal state
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(
    null,
  );

  // Folder modal state
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<FolderItem | null>(null);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "activity" | "folder";
    id: number;
    name: string;
  } | null>(null);

  const standaloneActivities = activities.filter((a) => !a.folderId);

  function openCreateActivity() {
    setEditingActivity(null);
    setActivityModalOpen(true);
  }

  function openEditActivity(activity: ActivityItem) {
    setEditingActivity(activity);
    setActivityModalOpen(true);
  }

  function openCreateFolder() {
    setEditingFolder(null);
    setFolderModalOpen(true);
  }

  function openEditFolder(folder: FolderItem) {
    setEditingFolder(folder);
    setFolderModalOpen(true);
  }

  function handleActivityFormSuccess() {
    setActivityModalOpen(false);
    setEditingActivity(null);
    router.refresh();
  }

  function handleFolderFormSuccess() {
    setFolderModalOpen(false);
    setEditingFolder(null);
    router.refresh();
  }

  function confirmDeleteActivity(activity: ActivityItem) {
    setDeleteTarget({ type: "activity", id: activity.id, name: activity.name });
  }

  function confirmDeleteFolder(folder: FolderItem) {
    setDeleteTarget({ type: "folder", id: folder.id, name: folder.name });
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      if (deleteTarget.type === "activity") {
        await deleteActivity(deleteTarget.id);
      } else {
        await deleteFolder(deleteTarget.id);
      }
      setDeleteTarget(null);
      router.refresh();
    });
  }

  function getActivitiesForFolder(folderId: number): ActivityItem[] {
    return activities.filter((a) => a.folderId === folderId);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-serif text-text">Activites</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={openCreateFolder}>
            + Nouveau dossier
          </Button>
          <Button size="sm" onClick={openCreateActivity}>
            + Nouvelle activite
          </Button>
        </div>
      </div>

      {/* Folders section */}
      {folders.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text2">
            Dossiers
          </h2>
          {folders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              activities={getActivitiesForFolder(folder.id)}
              onEditFolder={() => openEditFolder(folder)}
              onDeleteFolder={() => confirmDeleteFolder(folder)}
              onEditActivity={openEditActivity}
              onDeleteActivity={confirmDeleteActivity}
            />
          ))}
        </section>
      )}

      {/* Standalone activities section */}
      {standaloneActivities.length > 0 && (
        <section className="space-y-3">
          {folders.length > 0 && (
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text2">
              Activites sans dossier
            </h2>
          )}
          {standaloneActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onEdit={() => openEditActivity(activity)}
              onDelete={() => confirmDeleteActivity(activity)}
            />
          ))}
        </section>
      )}

      {/* Empty state */}
      {activities.length === 0 && folders.length === 0 && (
        <EmptyState
          title="Aucune activite"
          description="Ajoutez votre premiere activite pour la proposer a vos clients."
          action={
            <Button onClick={openCreateActivity}>
              + Nouvelle activite
            </Button>
          }
        />
      )}

      {/* Activity create/edit modal */}
      <Modal
        open={activityModalOpen}
        onClose={() => {
          setActivityModalOpen(false);
          setEditingActivity(null);
        }}
        title={editingActivity ? "Modifier l'activite" : "Nouvelle activite"}
        className="max-w-lg"
      >
        <ActivityForm
          activity={editingActivity}
          folders={folders}
          onSuccess={handleActivityFormSuccess}
          onCancel={() => {
            setActivityModalOpen(false);
            setEditingActivity(null);
          }}
        />
      </Modal>

      {/* Folder create/edit modal */}
      <Modal
        open={folderModalOpen}
        onClose={() => {
          setFolderModalOpen(false);
          setEditingFolder(null);
        }}
        title={editingFolder ? "Modifier le dossier" : "Nouveau dossier"}
      >
        <FolderForm
          folder={editingFolder}
          onSuccess={handleFolderFormSuccess}
          onCancel={() => {
            setFolderModalOpen(false);
            setEditingFolder(null);
          }}
        />
      </Modal>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={
          deleteTarget?.type === "activity"
            ? "Supprimer l'activite"
            : "Supprimer le dossier"
        }
        message={
          deleteTarget?.type === "activity"
            ? `Voulez-vous vraiment supprimer l'activite "${deleteTarget?.name}" ? Cette action est irreversible.`
            : `Voulez-vous vraiment supprimer le dossier "${deleteTarget?.name}" ? Les activites qu'il contient ne seront pas supprimees.`
        }
        confirmLabel="Supprimer"
        loading={isPending}
      />
    </div>
  );
}
