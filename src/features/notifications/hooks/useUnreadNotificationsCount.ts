import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { queryKeys } from "../../../infrastructure/query/query-keys";
import { useAuth } from "../../../shared/auth/AuthContext";
import { getUnreadNotificationsCountApi } from "../api/notifications.api";
import { parseUnreadCountResponse } from "../utils/notification.parser";

export function useUnreadNotificationsCount() {
  const { isAuthenticated } = useAuth();

  return useQuery<number, ApiError>({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: async ({ signal }) => {
      const response = await getUnreadNotificationsCountApi({ signal });

      try {
        return parseUnreadCountResponse(response);
      } catch (error) {
        throw new ApiError("Invalid unread notifications count response.", 500, "INVALID_RESPONSE", undefined, error);
      }
    },
    staleTime: 30_000,
    enabled: isAuthenticated,
  });
}

