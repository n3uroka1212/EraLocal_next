"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ActivityImageGallery } from "./ActivityImageGallery";
import { createActivity, updateActivity } from "@/actions/activities";
import type { ActivityItem, FolderItem } from "./ActivitiesManagementClient";

interface ActivityFormProps {
  activity?: ActivityItem | null;
  folders: FolderItem[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function ActivityForm({
  activity,
  folders,
  onSuccess,
  onCancel,
}: ActivityFormProps) {
  const isEdit = !!activity;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [name, setName] = useState(activity?.name ?? "");
  const [category, setCategory] = useState(activity?.category ?? "");
  const [description, setDescription] = useState(activity?.description ?? "");
  const [address, setAddress] = useState(activity?.address ?? "");
  const [phone, setPhone] = useState(activity?.phone ?? "");
  const [website, setWebsite] = useState(activity?.website ?? "");
  const [priceInfo, setPriceInfo] = useState(activity?.priceInfo ?? "");
  const [duration, setDuration] = useState(activity?.duration ?? "");
  const [folderId, setFolderId] = useState(
    activity?.folderId?.toString() ?? "",
  );

  const folderOptions = [
    { value: "", label: "Aucun dossier" },
    ...folders.map((f) => ({ value: f.id.toString(), label: f.name })),
  ];

  function handleSubmit() {
    setError("");
    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("description", description);
      formData.set("category", category);
      formData.set("address", address);
      formData.set("phone", phone);
      formData.set("website", website);
      formData.set("priceInfo", priceInfo);
      formData.set("duration", duration);
      if (folderId) {
        formData.set("folderId", folderId);
      }

      let result;
      if (isEdit && activity) {
        result = await updateActivity(activity.id, null, formData);
      } else {
        result = await createActivity(null, formData);
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
        label="Nom de l'activite"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ex: Randonnee en montagne"
        required
      />

      <Input
        label="Categorie"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Ex: Sport, Culture, Gastronomie..."
      />

      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Decrivez l'activite..."
        rows={3}
      />

      <Input
        label="Adresse"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Adresse du lieu"
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Telephone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="06 12 34 56 78"
          type="tel"
        />
        <Input
          label="Site web"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://..."
          type="url"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Tarif"
          value={priceInfo}
          onChange={(e) => setPriceInfo(e.target.value)}
          placeholder="Ex: 15 EUR / personne"
        />
        <Input
          label="Duree"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Ex: 2h, 1 journee"
        />
      </div>

      <Select
        label="Dossier"
        value={folderId}
        onChange={(e) => setFolderId(e.target.value)}
        options={folderOptions}
      />

      {/* Image gallery only shown in edit mode (need activity id to upload) */}
      {isEdit && activity && (
        <ActivityImageGallery
          activityId={activity.id}
          images={(activity.images as string[]) ?? []}
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
          {isEdit ? "Mettre a jour" : "Creer l'activite"}
        </Button>
      </div>
    </div>
  );
}
