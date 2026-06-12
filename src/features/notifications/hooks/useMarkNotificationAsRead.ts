import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { markNotificationAsReadApi } from "../api/notifications.api";
import { invalidateNotificationQueries } from "./invalidate-notification-queries";

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationKey: ["notifications", "mark-as-read"],
    mutationFn: (notificationId) => markNotificationAsReadApi(notificationId),
    onSuccess: async () => {
      await invalidateNotificationQueries(queryClient);
    },
  });
}

