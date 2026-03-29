import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { NotificationsProvider, useNotifications } from "../NotificationsProvider";

vi.mock("@/actions/notifications", () => ({
  markNotificationsRead: vi.fn().mockResolvedValue(undefined),
  clearNotifications: vi.fn().mockResolvedValue(undefined),
}));

const mockNotifications = [
  {
    id: 1,
    type: "ping_response",
    title: "Reponse ping",
    message: "Produit disponible",
    targetId: null,
    shopName: "Boulangerie",
    shopLogo: null,
    read: false,
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: 2,
    type: "order_ready",
    title: "Commande prete",
    message: null,
    targetId: 42,
    shopName: "Epicerie",
    shopLogo: null,
    read: true,
    createdAt: "2026-03-01T09:00:00Z",
  },
];

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <NotificationsProvider initialNotifications={mockNotifications}>
      {children}
    </NotificationsProvider>
  );
}

describe("NotificationsProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("provides initial notifications", () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });

    expect(result.current.notifications).toHaveLength(2);
    expect(result.current.unreadCount).toBe(1);
  });

  it("marks specific notifications as read", async () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });

    await act(async () => {
      await result.current.markRead([1]);
    });

    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications[0].read).toBe(true);
  });

  it("marks all notifications as read", async () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });

    await act(async () => {
      await result.current.markRead();
    });

    expect(result.current.unreadCount).toBe(0);
  });

  it("clears all notifications", async () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });

    await act(async () => {
      await result.current.clearAll();
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it("throws when used outside provider", () => {
    expect(() => {
      renderHook(() => useNotifications());
    }).toThrow("useNotifications must be used within a NotificationsProvider");
  });
});
