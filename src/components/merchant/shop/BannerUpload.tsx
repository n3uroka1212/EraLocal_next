"use client";

import { useTransition } from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import { uploadBanner, deleteBanner } from "@/actions/shop";

interface BannerUploadProps {
  banner: string | null;
}

export function BannerUpload({ banner }: BannerUploadProps) {
  const [isPending, startTransition] = useTransition();

  function handleUpload(file: File) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("file", file);
      await uploadBanner(formData);
    });
  }

  function handleRemove() {
    startTransition(async () => {
      await deleteBanner();
    });
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-text mb-3">Banniere</h2>
      <FileUpload
        label={isPending ? "Envoi en cours..." : "Choisir une banniere"}
        preview={banner}
        onUpload={handleUpload}
        onRemove={handleRemove}
      />
    </section>
  );
}
