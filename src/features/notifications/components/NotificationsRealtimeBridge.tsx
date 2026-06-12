import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { HubConnection } from "@microsoft/signalr";
import { queryKeys } from "../../../infrastructure/query/query-keys";
import { useAuth } from "../../../shared/auth/AuthContext";
import { useToast } from "../../../shared/ui/ToastProvider";
import type { Notification } from "../types/notification.types";
import { parseNotificationDto } from "../utils/notification.parser";
import {
  createNotificationsConnection,
  stopNotificationsConnection,
} from "../realtime/notifications-signalr";

const NOTIFICATION_EVENT_NAMES = [
  "ReceiveNotification",
  "NotificationReceived",
  "NewNotification",
  "notification",
];

function upsertNotification(current: Notification[] | undefined, next: Notification): Notification[] {
  const existing = current ?? [];
  const withoutDuplicate = existing.filter((notification) => notification.id !== next.id);

  return [next, ...withoutDuplicate].sort(
    (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
  );
}

export function NotificationsRealtimeBridge() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let isDisposed = false;
    const connection: HubConnection = createNotificationsConnection();

    const handleNotification = (payload: unknown) => {
      try {
        const notification = parseNotificationDto(payload);

        queryClient.setQueryData<Notification[]>(
          queryKeys.notifications.list,
          (current) => upsertNotification(current, notification),
        );

        void queryClient.invalidateQueries({
          queryKey: queryKeys.notifications.unreadCount,
        });

        if (notification.shouldToast) {
          showToast({
            id: `notification:${notification.id}`,
            message: `${notification.title}\n${notification.message}`,
          });
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn("[notifications] SignalR payload was invalid.", error);
        }

        void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list });
        void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount });
      }
    };

    NOTIFICATION_EVENT_NAMES.forEach((eventName) => {
      connection.on(eventName, handleNotification);
    });

    connection.start().catch((error) => {
      if (import.meta.env.DEV && !isDisposed) {
        console.warn("[notifications] SignalR connection failed.", error);
      }
    });

    return () => {
      isDisposed = true;
      NOTIFICATION_EVENT_NAMES.forEach((eventName) => {
        connection.off(eventName, handleNotification);
      });
      void stopNotificationsConnection(connection);
    };
  }, [isAuthenticated, queryClient, showToast]);

  return null;
}
