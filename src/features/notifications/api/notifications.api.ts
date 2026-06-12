import { getAppApiBaseUrl } from "../../../infrastructure/api/api-config";
import { requestJson } from "../../../infrastructure/api/http";

export type NotificationListFilters = {
  isRead?: boolean;
  pageNumber?: number;
  pageSize?: number;
  sortDirection?: "Asc" | "Desc";
};

function buildNotificationsPath(filters?: NotificationListFilters): string {
  const params = new URLSearchParams();

  if (typeof filters?.isRead === "boolean") {
    params.set("IsRead", String(filters.isRead));
  }

  if (typeof filters?.pageNumber === "number") {
    params.set("PageNumber", String(filters.pageNumber));
  }

  if (typeof filters?.pageSize === "number") {
    params.set("PageSize", String(filters.pageSize));
  }

  if (filters?.sortDirection) {
    params.set("SortDirection", filters.sortDirection);
  }

  const queryString = params.toString();

  return queryString ? `/api/notifications?${queryString}` : "/api/notifications";
}

export async function getNotificationsApi(
  filters?: NotificationListFilters,
  options?: { signal?: AbortSignal },
): Promise<unknown> {
  return requestJson<unknown>(buildNotificationsPath(filters), {
    method: "GET",
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
    withAuth: true,
  });
}

export async function getUnreadNotificationsCountApi(
  options?: { signal?: AbortSignal },
): Promise<unknown> {
  return requestJson<unknown>("/api/notifications/unread-count", {
    method: "GET",
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
    withAuth: true,
  });
}

export async function markNotificationAsReadApi(
  notificationId: string,
  options?: { signal?: AbortSignal },
): Promise<void> {
  await requestJson<void>(`/api/notifications/${notificationId}/mark-as-read`, {
    method: "PATCH",
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
    withAuth: true,
  });
}

export async function markAllNotificationsAsReadApi(
  options?: { signal?: AbortSignal },
): Promise<void> {
  await requestJson<void>("/api/notifications/mark-all-as-read", {
    method: "PATCH",
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
    withAuth: true,
  });
}
