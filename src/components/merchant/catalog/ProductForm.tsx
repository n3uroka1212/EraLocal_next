"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { VariantsEditor } from "./VariantsEditor";
import { createProduct, updateProduct, uploadProductPhoto } from "@/actions/catalog";

const UNIT_OPTIONS = [
  { value: "", label: "Aucune" },
  { value: "kg", label: "kg" },
  { value: "g", label: "g" },
  { value: "L", label: "L" },
  { value: "mL", label: "mL" },
  { value: "piece", label: "piece" },
  { value: "lot", label: "lot" },
  { value: "bouquet", label: "bouquet" },
];

interface ProductFormProps {
  product?: {
    id: number;
    name: string;
    description: string | null;
    price: number | null;
    priceUnit: string | null;
    category: string | null;
    image: string | null;
    available: boolean;
    variants: { id: number; name: string; price: number | null; available: boolean; sortOrder: number }[];
  };
  onSuccess?: () => void;
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const isEdit = !!product;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [priceUnit, setPriceUnit] = useState(product?.priceUnit ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.image ?? null,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);

  function handleSubmit() {
    setError("");
    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("description", description);
      if (price) formData.set("price", price);
      formData.set("priceUnit", priceUnit);
      formData.set("category", category);
      formData.set("available", "true");

      let result;
      if (isEdit) {
        result = await updateProduct(product.id, null, formData);
      } else {
        result = await createProduct(null, formData);
      }

      if (result.error) {
        setError(result.error);
        return;
      }

      // Upload photo if selected
      if (imageFile && result.id) {
        const photoData = new FormData();
        photoData.set("file", imageFile);
        await uploadProductPhoto(result.id, photoData);
      } else if (imageFile && isEdit) {
        const photoData = new FormData();
        photoData.set("file", imageFile);
        await uploadProductPhoto(product.id, photoData);
      }

      onSuccess?.();
    });
  }

  function handleImageUpload(file: File) {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  return (
    <div className="space-y-4">
      <FileUpload
        label="Photo du produit"
        preview={imagePreview}
        onUpload={handleImageUpload}
        onRemove={() => {
          setImageFile(null);
          setImagePreview(null);
        }}
      />

      <Input
        label="Nom du produit"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Mon produit"
      />

      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Prix"
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
        />
        <Select
          label="Unite"
          value={priceUnit}
          onChange={(e) => setPriceUnit(e.target.value)}
          options={UNIT_OPTIONS}
        />
      </div>

      <Input
        label="Categorie"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Ex: Pain, Fromage..."
      />

      {isEdit && (
        <VariantsEditor productId={product.id} variants={product.variants} />
      )}

      {error && (
        <p className="text-sm text-red bg-red-light px-3 py-2 rounded-input">
          {error}
        </p>
      )}

      <Button loading={isPending} onClick={handleSubmit}>
        {isEdit ? "Mettre a jour" : "Ajouter au catalogue"}
      </Button>
    </div>
  );
}
