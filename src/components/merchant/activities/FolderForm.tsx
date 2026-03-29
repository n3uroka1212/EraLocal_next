"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { createFolder, updateFolder } from "@/actions/activities";
import type { FolderItem } from "./ActivitiesManagementClient";

interface FolderFormProps {
  folder?: FolderItem | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function FolderForm({ folder, onSuccess, onCancel }: FolderFormProps) {
  const isEdit = !!folder;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [name, setName] = useState(folder?.name ?? "");
  const [description, setDescription] = useState(folder?.description ?? "");

  function handleSubmit() {
    setError("");
    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("description", description);

      let result;
      if (isEdit && folder) {
        result = await updateFolder(folder.id, null, formData);
      } else {
        result = await createFolder(null, formData);
      }

      if (result.error) {
        setError(result.error);
        return;
      }

      onSuccess();
    });
  }

  return (
    <div className="space-y-4">
      <Input
        label="Nom du dossier"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ex: Activites plein air"
        required
      />

      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description optionnelle..."
        rows={3}
      />

      {isEdit && folder?.code && (
        <Input
          label="Code du dossier"
          value={folder.code}
          readOnly
          className="opacity-70 cursor-not-allowed"
        />
      )}

      {error && (
        <p className="text-sm text-red bg-red-light px-3 py-2 rounded-input">
          {error}
        </p>
      )}

      <div className="flex gap-3 justify-end pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={isPending}>
          Annuler
        </Button>
        <Button loading={isPending} onClick={handleSubmit}>
          {isEdit ? "Mettre a jour" : "Creer le dossier"}
        </Button>
      </div>
    </div>
  );
}
