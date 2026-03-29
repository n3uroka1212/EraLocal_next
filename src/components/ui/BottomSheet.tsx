"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className = "",
}: BottomSheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[500] flex items-end"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full bg-bg2 rounded-t-sheet max-h-[85vh] overflow-y-auto animate-[slideUp_0.3s_ease] ${className}`}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        {title && (
          <div className="px-5 pb-3">
            <h2 className="text-lg font-semibold font-serif text-text">
              {title}
            </h2>
          </div>
        )}
        <div className="px-5 pb-6">{children}</div>
      </div>
    </div>
  );
}
