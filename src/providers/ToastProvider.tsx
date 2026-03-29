"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
};

type ToastContextType = {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration = 5000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setToasts((prev) => [...prev, { id, message, type, duration }]);
    },
    [],
  );

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Auto-dismiss toasts after their duration
  useEffect(() => {
    const timers = toasts
      .filter((t) => t.duration && t.duration > 0)
      .map((t) =>
        setTimeout(() => {
          dismissToast(t.id);
        }, t.duration),
      );

    return () => timers.forEach(clearTimeout);
  }, [toasts, dismissToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismissToast, clearToasts }}>
      {children}
      {/* Toast overlay */}
      {toasts.length > 0 && (
        <div
          className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
          aria-live="polite"
          role="status"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              data-testid="toast"
              className={`rounded-lg px-4 py-3 text-sm shadow-lg transition-all ${
                toast.type === "success"
                  ? "bg-green-600 text-white"
                  : toast.type === "error"
                    ? "bg-red-600 text-white"
                    : toast.type === "warning"
                      ? "bg-yellow-500 text-black"
                      : "bg-[var(--bg3)] text-[var(--text)]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span>{toast.message}</span>
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="text-current opacity-70 hover:opacity-100"
                  aria-label="Fermer"
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
