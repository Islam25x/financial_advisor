import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { markAllNotificationsAsReadApi } from "../api/notifications.api";
import { invalidateNotificationQueries } from "./invalidate-notification-queries";

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError>({
    mutationKey: ["notifications", "mark-all-as-read"],
    mutationFn: () => markAllNotificationsAsReadApi(),
    onSuccess: async () => {
      await invalidateNotificationQueries(queryClient);
    },
  });
}

