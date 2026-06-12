import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { queryKeys } from "../../../infrastructure/query/query-keys";
import { useAuth } from "../../../shared/auth/AuthContext";
import {
  getNotificationsApi,
  type NotificationListFilters,
} from "../api/notifications.api";
import type { Notification } from "../types/notification.types";
import { parseNotificationsResponse } from "../utils/notification.parser";

export function useNotifications(filters?: NotificationListFilters) {
  const { isAuthenticated } = useAuth();

  return useQuery<Notification[], ApiError>({
    queryKey: queryKeys.notifications.list(filters),
    queryFn: async ({ signal }) => {
      const response = await getNotificationsApi(filters, { signal });

      try {
        return parseNotificationsResponse(response);
      } catch (error) {
        throw new ApiError("Invalid notifications response.", 500, "INVALID_RESPONSE", undefined, error);
      }
    },
    staleTime: 30_000,
    enabled: isAuthenticated,
  });
}
