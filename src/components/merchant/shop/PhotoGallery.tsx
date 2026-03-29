"use client";

import { useTransition } from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import { addPhoto, deletePhoto } from "@/actions/shop";

interface PhotoGalleryProps {
  photos: { id: number; url: string }[];
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [isPending, startTransition] = useTransition();

  function handleUpload(file: File) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("file", file);
      await addPhoto(formData);
    });
  }

  function handleDelete(photoId: number) {
    startTransition(async () => {
      await deletePhoto(photoId);
    });
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-text">
        Galerie photos ({photos.length}/10)
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((photo) => (
          <div key={photo.id} className="relative rounded-card overflow-hidden">
            <img
              src={photo.url}
              alt="Photo boutique"
              className="w-full h-32 object-cover"
            />
            <button
              onClick={() => handleDelete(photo.id)}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-black/60 text-white text-xs hover:bg-black/80 transition-colors"
              aria-label="Supprimer"
            >
              &#x2715;
            </button>
          </div>
        ))}
      </div>

      {photos.length < 10 && (
        <FileUpload
          label={isPending ? "Envoi en cours..." : "Ajouter une photo"}
          onUpload={handleUpload}
        />
      )}
    </section>
  );
}
