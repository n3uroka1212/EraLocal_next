"use client";

import { useRef, useState, type DragEvent } from "react";

interface FileUploadProps {
  accept?: string;
  onUpload: (file: File) => void;
  label?: string;
  preview?: string | null;
  onRemove?: () => void;
  className?: string;
}

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export function FileUpload({
  accept = "image/*",
  onUpload,
  label = "Choisir un fichier",
  preview,
  onRemove,
  className = "",
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) return;
    onUpload(file);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {preview ? (
        <div className="relative rounded-card overflow-hidden">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-40 object-cover"
          />
          {onRemove && (
            <button
              onClick={onRemove}
              className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-black/60 text-white text-xs hover:bg-black/80 transition-colors"
              aria-label="Supprimer"
            >
              &#x2715;
            </button>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-card cursor-pointer transition-colors ${
            dragging
              ? "border-terra bg-terra-light/50"
              : "border-border hover:border-terra"
          }`}
        >
          <span className="text-2xl text-text3">📷</span>
          <span className="text-sm text-text2">{label}</span>
          <span className="text-xs text-text3">
            Glisser-deposer ou cliquer
          </span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="hidden"
      />
    </div>
  );
}
