"use client";

import { useState } from "react";
import { useNotifications } from "@/providers/NotificationsProvider";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DateDisplay } from "@/components/ui/DateDisplay";

// Notification type icons
const TYPE_ICONS: Record<string, string> = {
  order_status: "📦",
  order_ready: "✅",
  order_cancelled: "❌",
  ping_response: "🔔",
  promotion: "🎁",
  event: "📅",
  new_product: "🆕",
  welcome: "👋",
};

function getNotificationIcon(type: string): string {
  return TYPE_ICONS[type] ?? "🔔";
}

export function NotificationsClient() {
  const { notifications, unreadCount, markRead, clearAll, loading } =
    useNotifications();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [clearing, setClearing] = useState(false);

  async function handleMarkAllRead() {
    await markRead();
  }

  async function handleClearAll() {
    setClearing(true);
    await clearAll();
    setClearing(false);
    setShowClearDialog(false);
  }

  async function handleMarkOneRead(id: number) {
    await markRead([id]);
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-text">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-text2 mt-0.5">
              {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Actions bar */}
      {notifications.length > 0 && (
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={handleMarkAllRead}>
              Tout marquer comme lu
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowClearDialog(true)}
          >
            Tout supprimer
          </Button>
        </div>
      )}

      {/* Notifications list */}
      {notifications.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="Aucune notification"
          description="Vos notifications apparaitront ici lorsqu'il y aura du nouveau."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => {
                if (!notification.read) {
                  handleMarkOneRead(notification.id);
                }
              }}
              className={`w-full text-left p-4 rounded-card border transition-colors ${
                notification.read
                  ? "bg-bg2 border-border"
                  : "bg-white border-[#C76B4A]/30 shadow-sm"
              }`}
            >
              <div className="flex gap-3">
                {/* Icon */}
                <div
                  className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    notification.read ? "bg-bg3" : "bg-terra-light"
                  }`}
                >
                  {notification.shopLogo ||
                    getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className={`text-sm truncate ${
                        notification.read
                          ? "text-text2 font-medium"
                          : "text-text font-semibold"
                      }`}
                    >
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <span className="shrink-0 w-2 h-2 rounded-full bg-[#C76B4A] mt-1.5" />
                    )}
                  </div>

                  {notification.message && (
                    <p className="text-xs text-text2 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-1">
                    <DateDisplay
                      date={notification.createdAt}
                      relative
                      className="text-xs text-text3"
                    />
                    {notification.shopName && (
                      <span className="text-xs text-text3">
                        {notification.shopName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Clear confirmation dialog */}
      <ConfirmDialog
        open={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={handleClearAll}
        title="Supprimer toutes les notifications"
        message="Etes-vous sur de vouloir supprimer toutes vos notifications ? Cette action est irreversible."
        confirmLabel="Tout supprimer"
        variant="danger"
        loading={clearing}
      />
    </div>
  );
}
