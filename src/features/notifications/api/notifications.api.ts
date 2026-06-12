import { getAppApiBaseUrl } from "../../../infrastructure/api/api-config";
import { requestJson } from "../../../infrastructure/api/http";

export async function getNotificationsApi(options?: { signal?: AbortSignal }): Promise<unknown> {
  return requestJson<unknown>("/api/notifications", {
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

