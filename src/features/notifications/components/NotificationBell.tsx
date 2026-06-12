import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Check,
  CircleAlert,
  Info,
  Megaphone,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import Button from "../../../shared/ui/Button";
import Text from "../../../shared/ui/Text";
import { cn } from "../../../shared/ui/types";
import { useMarkAllNotificationsAsRead } from "../hooks/useMarkAllNotificationsAsRead";
import { useMarkNotificationAsRead } from "../hooks/useMarkNotificationAsRead";
import { useNotifications } from "../hooks/useNotifications";
import { useUnreadNotificationsCount } from "../hooks/useUnreadNotificationsCount";
import type { Notification } from "../types/notification.types";
import { formatNotificationRelativeTime } from "../utils/notification.formatters";

const UNREAD_NOTIFICATION_FILTERS = {
  isRead: false,
  pageSize: 4,
  sortDirection: "Desc",
} as const;

function getNotificationIcon(type: string, severity: string): LucideIcon {
  const normalizedType = type.toLowerCase();
  const normalizedSeverity = severity.toLowerCase();

  if (normalizedSeverity.includes("error") || normalizedSeverity.includes("warning")) {
    return ShieldAlert;
  }

  if (normalizedType.includes("alert")) {
    return CircleAlert;
  }

  if (normalizedType.includes("announcement")) {
    return Megaphone;
  }

  return Info;
}

function NotificationItem({
  notification,
  onMarkAsRead,
  isMarkingAsRead,
}: {
  notification: Notification;
  onMarkAsRead: (notificationId: string) => void;
  isMarkingAsRead: boolean;
}) {
  const Icon = getNotificationIcon(notification.type, notification.severity);

  return (
    <article
      className={cn(
        "flex gap-3 rounded-lg border border-border px-3 py-3 transition",
        notification.isRead ? "bg-surface" : "bg-primary/10",
      )}
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          {!notification.isRead && (
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          )}
          <div className="min-w-0 flex-1">
            <Text as="h3" variant="body" weight="bold" className="truncate text-sm text-text-primary">
              {notification.title}
            </Text>
            <Text variant="caption" className="mt-1 line-clamp-2 text-text-secondary">
              {notification.message}
            </Text>
            <Text variant="caption" className="mt-2 text-text-muted">
              {formatNotificationRelativeTime(notification.createdAt)}
            </Text>
          </div>
        </div>
      </div>
      {!notification.isRead && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          shape="circle"
          className="mt-0.5 h-8 w-8 shrink-0 text-primary hover:bg-primary/10"
          aria-label={`Mark ${notification.title} as seen`}
          loading={isMarkingAsRead}
          onClick={(event) => {
            event.stopPropagation();
            onMarkAsRead(notification.id);
          }}
        >
          <Check size={16} />
        </Button>
      )}
    </article>
  );
}

function NotificationsDropdown({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  markingNotificationId,
  isMarkingAllAsRead,
}: {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  markingNotificationId: string | null;
  isMarkingAllAsRead: boolean;
}) {
  return (
    <div
      role="dialog"
      aria-label="Notifications"
      className="absolute right-0 top-[calc(100%+0.75rem)] z-[1200] w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-border bg-surface p-3 shadow-[0_18px_50px_rgba(15,23,42,0.16)]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
        <Text as="h2" variant="body" weight="bold" className="text-text-primary">
          Notifications
        </Text>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-primary hover:bg-primary/10"
          loading={isMarkingAllAsRead}
          onClick={onMarkAllAsRead}
        >
          Mark all as seen
        </Button>
      </div>

      <div className="mt-3 max-h-[22rem] overflow-y-auto pr-1">
        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                isMarkingAsRead={markingNotificationId === notification.id}
              />
            ))}
          </div>
        ) : (
          <Text variant="body" className="py-8 text-center text-text-muted">
            No notifications yet.
          </Text>
        )}
      </div>
    </div>
  );
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const { data: notifications = [] } = useNotifications(UNREAD_NOTIFICATION_FILTERS);
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        shape="circle"
        className="relative h-11 w-11 border-1 border-solid border-gray-400 p-0 text-black hover:bg-primary-700 hover:text-white"
        aria-label="Notifications"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>
      {isOpen && (
        <NotificationsDropdown
          notifications={notifications}
          onMarkAsRead={(notificationId) => markAsReadMutation.mutate(notificationId)}
          onMarkAllAsRead={() => markAllAsReadMutation.mutate()}
          markingNotificationId={markAsReadMutation.variables ?? null}
          isMarkingAllAsRead={markAllAsReadMutation.isPending}
        />
      )}
    </div>
  );
}
