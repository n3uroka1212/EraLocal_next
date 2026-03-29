"use client";

import { useEffect } from "react";

interface Props {
  url: string | null;
  onClose: () => void;
}

export function DocumentViewer({ url, onClose }: Props) {
  useEffect(() => {
    if (!url) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [url, onClose]);

  if (!url) return null;

  const isPdf = url.toLowerCase().endsWith(".pdf");

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease]" />

      {/* Content */}
      <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col animate-[scaleIn_0.3s_ease]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-bg2 border border-border text-text2 hover:text-text hover:bg-bg3 transition-colors shadow-lg cursor-pointer"
          aria-label="Fermer le document"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Document display */}
        <div className="bg-bg2 rounded-card overflow-hidden shadow-lg">
          {isPdf ? (
            <iframe
              src={url}
              className="w-full h-[80vh]"
              title="Document PDF"
            />
          ) : (
            <div className="flex items-center justify-center p-4 bg-black/5 max-h-[80vh] overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt="Document"
                className="max-w-full max-h-[75vh] object-contain rounded-small"
              />
            </div>
          )}
        </div>

        {/* Open in new tab link */}
        <div className="flex justify-center mt-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-text3 hover:text-terra transition-colors underline"
          >
            Ouvrir dans un nouvel onglet
          </a>
        </div>
      </div>
    </div>
  );
}
