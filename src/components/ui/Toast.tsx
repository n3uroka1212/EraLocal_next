"use client";

import { useEffect, useState, useCallback } from "react";

type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

const typeClasses: Record<ToastType, string> = {
  success: "bg-green-light text-green border-green/20",
  error: "bg-red-light text-red border-red/20",
  info: "bg-bg2 text-text border-border",
};

const typeIcons: Record<ToastType, string> = {
  success: "\u2713",
  error: "\u2715",
  info: "\u24D8",
};

let addToastExternal: ((type: ToastType, message: string) => void) | null =
  null;

export function toast(type: ToastType, message: string) {
  addToastExternal?.(type, message);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    addToastExternal = addToast;
    return () => {
      addToastExternal = null;
    };
  }, [addToast]);

  return (
    <div className="fixed top-4 right-4 z-[300] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto px-4 py-3 rounded-button border text-sm font-medium shadow-lg animate-[cardFadeIn_0.3s_ease] ${typeClasses[t.type]}`}
        >
          <span className="mr-2">{typeIcons[t.type]}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
