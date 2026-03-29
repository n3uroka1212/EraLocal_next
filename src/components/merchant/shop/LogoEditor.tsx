"use client";

import { useTransition } from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import { uploadLogo, deleteLogo } from "@/actions/shop";

const EMOJIS = [
  "🥖", "🥐", "🧁", "🍰", "🥗", "🧀", "🥩", "🐟",
  "🥑", "🍓", "🫙", "🍯", "☕", "🍷", "🐾", "🐕",
  "🐈", "🌸", "🎁", "📦", "👗", "👟",
];

interface LogoEditorProps {
  logo: string | null;
  logoEmoji: string;
  onEmojiChange: (emoji: string) => void;
}

export function LogoEditor({ logo, logoEmoji, onEmojiChange }: LogoEditorProps) {
  const [isPending, startTransition] = useTransition();

  function handleUpload(file: File) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("file", file);
      await uploadLogo(formData);
    });
  }

  function handleRemove() {
    startTransition(async () => {
      await deleteLogo();
    });
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-text">Logo</h2>

      <div className="space-y-4">
        <FileUpload
          label={isPending ? "Envoi en cours..." : "Uploader un logo"}
          preview={logo}
          onUpload={handleUpload}
          onRemove={handleRemove}
        />

        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.5px] text-text2 mb-2">
            Ou choisir un emoji
          </p>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() =>
                  onEmojiChange(logoEmoji === emoji ? "" : emoji)
                }
                className={`w-11 h-11 flex items-center justify-center text-2xl rounded-button transition-all duration-150 cursor-pointer hover:scale-110 hover:bg-terra-light ${
                  logoEmoji === emoji
                    ? "border-2 border-terra bg-terra-light"
                    : "border border-transparent"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
