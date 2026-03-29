"use client";

import { useState, useTransition, useCallback } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CityAccountForm } from "./CityAccountForm";
import { deleteCityAccount } from "@/actions/admin";
import { toast } from "@/components/ui/Toast";

export interface CityAccountRow {
  id: number;
  name: string;
  email: string;
  department: string | null;
  region: string | null;
  contactName: string | null;
  phone: string | null;
  active: boolean;
  createdAt: string;
}

interface Props {
  cities: CityAccountRow[];
}

export function CityAccountsClient({ cities }: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CityAccountRow | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<{
    name: string;
    password: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreated = useCallback(
    (name: string, password: string) => {
      setCreateOpen(false);
      setGeneratedPassword({ name, password });
    },
    [],
  );

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteCityAccount(deleteTarget.id);
      if (result.error) {
        toast("error", result.error);
      } else {
        toast("success", `Compte "${deleteTarget.name}" supprime`);
      }
      setDeleteTarget(null);
    });
  }

  return (
    <div className="space-y-4">
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text2">
          {cities.length} compte{cities.length !== 1 ? "s" : ""} ville
        </p>
        <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
          + Nouveau compte
        </Button>
      </div>

      {/* List */}
      {cities.length === 0 ? (
        <div className="bg-bg2 border border-border rounded-card p-8 text-center">
          <p className="text-text2 text-sm">
            Aucun compte ville pour le moment
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {cities.map((city) => (
            <CityAccountCard
              key={city.id}
              city={city}
              onDelete={() => setDeleteTarget(city)}
            />
          ))}
        </div>
      )}

      {/* Create form modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nouveau compte ville"
        className="max-w-lg"
      >
        <CityAccountForm
          onSuccess={handleCreated}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer le compte"
        message={`Supprimer definitivement le compte ville "${deleteTarget?.name}" ? Cette action est irreversible.`}
        confirmLabel="Supprimer"
        variant="danger"
        loading={isPending}
      />

      {/* Password display modal (PinDisplay-style) */}
      <Modal
        open={!!generatedPassword}
        onClose={() => setGeneratedPassword(null)}
        title="Compte cree avec succes"
      >
        {generatedPassword && (
          <PasswordDisplay
            name={generatedPassword.name}
            password={generatedPassword.password}
            onClose={() => setGeneratedPassword(null)}
          />
        )}
      </Modal>
    </div>
  );
}

/* ---------- City Account Card ---------- */

function CityAccountCard({
  city,
  onDelete,
}: {
  city: CityAccountRow;
  onDelete: () => void;
}) {
  const createdDate = new Date(city.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="bg-bg2 border border-border rounded-card p-5 animate-[cardFadeIn_0.3s_ease]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-text text-base">{city.name}</h3>
            <Badge variant={city.active ? "green" : "default"}>
              {city.active ? "Actif" : "Inactif"}
            </Badge>
          </div>
          <p className="text-sm text-text2 mt-0.5">{city.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text3">{createdDate}</span>
          <Button variant="danger" size="sm" onClick={onDelete}>
            Supprimer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
        <DetailItem label="Departement" value={city.department} />
        <DetailItem label="Region" value={city.region} />
        <DetailItem label="Contact" value={city.contactName} />
        <DetailItem label="Telephone" value={city.phone} />
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-text3">
        {label}
      </p>
      <p className="text-sm text-text truncate">{value ?? "—"}</p>
    </div>
  );
}

/* ---------- Password Display (PinDisplay-style) ---------- */

function PasswordDisplay({
  name,
  password,
  onClose,
}: {
  name: string;
  password: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = password;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-text2">
        Mot de passe initial pour{" "}
        <span className="font-semibold text-text">{name}</span>.
      </p>

      <div className="flex justify-center py-4">
        <span className="text-2xl font-mono font-bold tracking-[0.15em] text-text bg-bg3 px-6 py-3 rounded-card border border-border select-all">
          {password}
        </span>
      </div>

      <div className="bg-orange-light border border-orange/20 rounded-card px-4 py-3">
        <p className="text-sm text-[#92400E] font-medium">
          Ce mot de passe ne sera plus affiche. Notez-le et transmettez-le de
          maniere securisee.
        </p>
      </div>

      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={handleCopy}>
          {copied ? "Copie !" : "Copier"}
        </Button>
        <Button variant="primary" onClick={onClose}>
          Fermer
        </Button>
      </div>
    </div>
  );
}
