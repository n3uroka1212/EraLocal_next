"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { markNotificationsRead, clearNotifications } from "@/actions/notifications";

type Notification = {
  id: number;
  type: string;
  title: string;
  message: string | null;
  targetId: number | null;
  shopName: string | null;
  shopLogo: string | null;
  read: boolean;
  createdAt: string;
};

type NotificationsContextType = {
  notifications: Notification[];
  unreadCount: number;
  markRead: (ids?: number[]) => Promise<void>;
  clearAll: () => Promise<void>;
  loading: boolean;
};

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function NotificationsProvider({
  children,
  initialNotifications = [],
}: {
  children: ReactNode;
  initialNotifications?: Notification[];
}) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = useCallback(
    async (ids?: number[]) => {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) =>
          ids ? (ids.includes(n.id) ? { ...n, read: true } : n) : { ...n, read: true },
        ),
      );
      await markNotificationsRead(ids);
    },
    [],
  );

  const clearAll = useCallback(async () => {
    setNotifications([]);
    await clearNotifications();
  }, []);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch {
        // Silently fail on poll errors
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, markRead, clearAll, loading }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextType {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
}
