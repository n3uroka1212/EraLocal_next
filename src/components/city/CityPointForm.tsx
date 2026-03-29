"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { toast } from "@/components/ui/Toast";
import {
  createCityPoint,
  updateCityPoint,
  uploadCityPointImage,
} from "@/actions/city";

const CATEGORY_OPTIONS = [
  { value: "", label: "-- Categorie --" },
  { value: "monument", label: "Monument" },
  { value: "eglise", label: "Eglise" },
  { value: "parc", label: "Parc" },
  { value: "musee", label: "Musee" },
  { value: "chateau", label: "Chateau" },
  { value: "place", label: "Place" },
  { value: "fontaine", label: "Fontaine" },
  { value: "theatre", label: "Theatre" },
  { value: "bibliotheque", label: "Bibliotheque" },
  { value: "marche", label: "Marche" },
  { value: "pont", label: "Pont" },
  { value: "autre", label: "Autre" },
];

export interface CityPointFormData {
  id?: number;
  name: string;
  category: string;
  description: string;
  history: string;
  address: string;
  latitude: string;
  longitude: string;
  active?: boolean;
}

interface CityPointFormProps {
  initial?: CityPointFormData;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CityPointForm({ initial, onSuccess, onCancel }: CityPointFormProps) {
  const isEdit = !!initial?.id;
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [history, setHistory] = useState(initial?.history ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [latitude, setLatitude] = useState(initial?.latitude ?? "");
  const [longitude, setLongitude] = useState(initial?.longitude ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  function handleImageSelect(file: File) {
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  }

  function handleImageRemove() {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  }

  function handleSubmit() {
    if (!name.trim()) {
      toast("error", "Le nom est requis");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", name.trim());
      if (category) formData.set("category", category);
      if (description) formData.set("description", description);
      if (history) formData.set("history", history);
      if (address) formData.set("address", address);
      if (latitude) formData.set("latitude", latitude);
      if (longitude) formData.set("longitude", longitude);

      let result;

      if (isEdit && initial?.id) {
        formData.set("active", String(initial.active !== false));
        result = await updateCityPoint(initial.id, null, formData);
      } else {
        result = await createCityPoint(null, formData);
      }

      if (result.error) {
        toast("error", result.error);
        return;
      }

      // Upload image if selected
      const pointId = isEdit ? initial!.id! : result.id;
      if (imageFile && pointId) {
        const imgFormData = new FormData();
        imgFormData.set("image", imageFile);
        const imgResult = await uploadCityPointImage(pointId, imgFormData);
        if (imgResult.error) {
          toast("error", imgResult.error);
        }
      }

      toast("success", isEdit ? "Point mis a jour" : "Point cree");
      onSuccess();
    });
  }

  return (
    <div className="space-y-4">
      <Input
        label="Nom"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nom du point d'interet"
        required
      />

      <Select
        label="Categorie"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        options={CATEGORY_OPTIONS}
      />

      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description du lieu..."
        rows={3}
      />

      <Textarea
        label="Histoire"
        value={history}
        onChange={(e) => setHistory(e.target.value)}
        placeholder="Anecdotes et histoire du lieu..."
        rows={3}
      />

      <Input
        label="Adresse"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Adresse du point d'interet"
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Latitude"
          type="number"
          step="any"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          placeholder="43.2965"
        />
        <Input
          label="Longitude"
          type="number"
          step="any"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          placeholder="5.3698"
        />
      </div>

      {/* Image upload */}
      <div>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.5px] text-text2 mb-1.5">
          Image
        </p>
        <FileUpload
          label={isPending ? "Envoi..." : "Choisir une image"}
          preview={imagePreview}
          onUpload={handleImageSelect}
          onRemove={handleImageRemove}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={isPending}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} loading={isPending}>
          {isEdit ? "Enregistrer" : "Creer"}
        </Button>
      </div>
    </div>
  );
}
