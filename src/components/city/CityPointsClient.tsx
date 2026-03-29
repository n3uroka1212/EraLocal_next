"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";
import { CityPointCard, type CityPointItem } from "./CityPointCard";
import { CityPointForm, type CityPointFormData } from "./CityPointForm";
import { deleteCityPoint } from "@/actions/city";

interface CityPointsClientProps {
  points: CityPointItem[];
}

function pointToFormData(point: CityPointItem): CityPointFormData {
  return {
    id: point.id,
    name: point.name,
    category: point.category ?? "",
    description: point.description ?? "",
    history: point.history ?? "",
    address: point.address ?? "",
    latitude: point.latitude != null ? String(point.latitude) : "",
    longitude: point.longitude != null ? String(point.longitude) : "",
    active: point.active,
  };
}

export function CityPointsClient({ points }: CityPointsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPoint, setEditingPoint] = useState<CityPointFormData | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<CityPointItem | null>(null);

  function handleCreate() {
    setEditingPoint(undefined);
    setShowFormModal(true);
  }

  function handleEdit(point: CityPointItem) {
    setEditingPoint(pointToFormData(point));
    setShowFormModal(true);
  }

  function handleFormSuccess() {
    setShowFormModal(false);
    setEditingPoint(undefined);
    router.refresh();
  }

  function handleFormCancel() {
    setShowFormModal(false);
    setEditingPoint(undefined);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    const pointId = deleteTarget.id;
    setDeleteTarget(null);
    startTransition(async () => {
      const result = await deleteCityPoint(pointId);
      if (result.error) {
        toast("error", result.error);
      } else {
        toast("success", "Point supprime");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Points d&apos;interet</h1>
        <Button onClick={handleCreate}>
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Ajouter
        </Button>
      </div>

      {/* List */}
      {points.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-4xl mb-3">{"\uD83D\uDCCD"}</span>
          <p className="text-lg font-medium text-text mb-1">
            Aucun point d&apos;interet
          </p>
          <p className="text-sm text-text2 mb-4">
            Ajoutez les lieux remarquables de votre ville
          </p>
          <Button onClick={handleCreate}>Creer un point</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {points.map((point) => (
            <CityPointCard
              key={point.id}
              point={point}
              onEdit={() => handleEdit(point)}
              onDelete={() => setDeleteTarget(point)}
              isPending={isPending}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={showFormModal}
        onClose={handleFormCancel}
        title={editingPoint ? "Modifier le point" : "Nouveau point d'interet"}
        className="max-w-lg"
      >
        <CityPointForm
          initial={editingPoint}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer ce point ?"
        message={`Le point "${deleteTarget?.name ?? ""}" sera definitivement supprime.`}
        confirmLabel="Supprimer"
        loading={isPending}
      />
    </div>
  );
}
