"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";
import { createBackup, restoreBackup } from "@/actions/admin";

// --- Types ---

interface Backup {
  id: number;
  name: string;
  createdAt: string; // ISO string
  size: string;
  stats: Record<string, number>;
}

interface BackupManagerClientProps {
  backups: Backup[];
}

// --- Helpers ---

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "A l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

// --- Main Component ---

export function BackupManagerClient({ backups: initialBackups }: BackupManagerClientProps) {
  const [backups, setBackups] = useState(initialBackups);
  const [isPending, startTransition] = useTransition();
  const [restoreTarget, setRestoreTarget] = useState<Backup | null>(null);

  // --- Create Backup ---
  const handleCreateBackup = () => {
    startTransition(async () => {
      const result = await createBackup();
      if (result.error) {
        toast("error", result.error);
      } else {
        toast("success", `Backup "${result.name}" cree`);
        // Add to local list optimistically
        if (result.name) {
          setBackups((prev) => [
            {
              id: Date.now(),
              name: result.name!,
              createdAt: new Date().toISOString(),
              size: result.size ?? "~0 KB",
              stats: {},
            },
            ...prev,
          ]);
        }
      }
    });
  };

  // --- Restore Backup ---
  const handleRestore = () => {
    if (!restoreTarget) return;
    startTransition(async () => {
      const result = await restoreBackup(restoreTarget.name);
      if (result.error) {
        toast("error", result.error);
      } else {
        toast("success", `Backup "${restoreTarget.name}" restaure`);
      }
      setRestoreTarget(null);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-text">Backups</h1>
          <p className="text-sm text-text2 mt-1">
            Gestion des sauvegardes de la base de donnees
          </p>
        </div>
        <Button onClick={handleCreateBackup} loading={isPending}>
          + Creer un backup
        </Button>
      </div>

      {/* Backup List */}
      {backups.length === 0 ? (
        <div className="bg-bg2 border border-border rounded-card p-8 text-center">
          <p className="text-text2 text-sm">
            Aucun backup disponible. Creez votre premier backup.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {backups.map((backup) => (
            <div
              key={backup.id}
              className="bg-bg2 border border-border rounded-card p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-text truncate">
                    {backup.name}
                  </h3>
                  <Badge variant="green">Complet</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-text2">
                  <span title={formatDate(backup.createdAt)}>
                    {formatRelative(backup.createdAt)}
                  </span>
                  <span className="text-text3">|</span>
                  <span>{backup.size}</span>
                  {backup.stats.shops != null && (
                    <>
                      <span className="text-text3">|</span>
                      <span>
                        {backup.stats.shops ?? 0} boutiques,{" "}
                        {backup.stats.products ?? 0} produits,{" "}
                        {backup.stats.orders ?? 0} commandes,{" "}
                        {backup.stats.clients ?? 0} clients
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setRestoreTarget(backup)}
                >
                  Restaurer
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Restore Confirm */}
      <ConfirmDialog
        open={!!restoreTarget}
        onClose={() => setRestoreTarget(null)}
        onConfirm={handleRestore}
        title="Restaurer un backup"
        message={`Etes-vous sur de vouloir restaurer le backup "${restoreTarget?.name}" ? Les donnees actuelles seront remplacees.`}
        confirmLabel="Restaurer"
        variant="danger"
        loading={isPending}
      />
    </div>
  );
}
