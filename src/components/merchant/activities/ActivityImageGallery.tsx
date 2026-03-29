"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  uploadActivityImage,
  deleteActivityImage,
} from "@/actions/activities";

interface ActivityImageGalleryProps {
  activityId: number;
  images: string[];
}

const MAX_IMAGES = 10;

export function ActivityImageGallery({
  activityId,
  images,
}: ActivityImageGalleryProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleUpload(file: File) {
    setError("");
    startTransition(async () => {
      const formData = new FormData();
      formData.set("image", file);
      const result = await uploadActivityImage(activityId, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleDelete(index: number) {
    setError("");
    startTransition(async () => {
      const result = await deleteActivityImage(activityId, index);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  const canUpload = images.length < MAX_IMAGES;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[0.68rem] font-semibold uppercase tracking-[0.5px] text-text2">
          Images ({images.length}/{MAX_IMAGES})
        </label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={!canUpload || isPending}
        >
          + Ajouter
        </Button>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-button overflow-hidden bg-bg3"
            >
              <img
                src={img}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleDelete(index)}
                disabled={isPending}
                className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-black/60 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red disabled:opacity-50"
                aria-label={`Supprimer image ${index + 1}`}
              >
                &#x2715;
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-6 border-2 border-dashed border-border rounded-card">
          <button
            onClick={() => inputRef.current?.click()}
            disabled={isPending}
            className="text-sm text-text3 hover:text-terra transition-colors"
          >
            Cliquer pour ajouter des images
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red">{error}</p>
      )}

      {!canUpload && (
        <p className="text-xs text-text3">
          Nombre maximum d&apos;images atteint
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = "";
        }}
        className="hidden"
      />
    </div>
  );
}
