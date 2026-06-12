import { ApiError } from "../../../infrastructure/api/api-error";
import { parseBackendTimestamp } from "../../../shared/utils/date-time";
import type { NotificationDto } from "../api/notification.dto";
import type { Notification } from "../types/notification.types";

type NotificationsEnvelope = {
  items?: unknown;
  data?: unknown;
  result?: unknown;
  payload?: unknown;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asTrimmedString(value: unknown, fieldName: string): string {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  throw new ApiError(`Notification field "${fieldName}" is invalid.`, 500, "INVALID_RESPONSE");
}

function asBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  throw new ApiError(`Notification field "${fieldName}" is invalid.`, 500, "INVALID_RESPONSE");
}

function parseDate(value: unknown, fieldName: string): Date {
  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(`Notification field "${fieldName}" is invalid.`, 500, "INVALID_RESPONSE");
  }

  const parsed = parseBackendTimestamp(value);
  if (!parsed) {
    throw new ApiError(`Notification field "${fieldName}" is invalid.`, 500, "INVALID_RESPONSE");
  }

  return parsed;
}

function parseNullableDate(value: unknown, fieldName: string): Date | null {
  if (value == null || value === "") {
    return null;
  }

  return parseDate(value, fieldName);
}

function extractNotificationsData(response: unknown): unknown[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (!isObject(response)) {
    throw new ApiError("Notifications response is invalid.", 500, "INVALID_RESPONSE");
  }

  const candidate = response as NotificationsEnvelope;

  if (Array.isArray(candidate.items)) {
    return candidate.items;
  }

  if (candidate.data !== undefined) {
    return extractNotificationsData(candidate.data);
  }

  if (candidate.result !== undefined) {
    return extractNotificationsData(candidate.result);
  }

  if (candidate.payload !== undefined) {
    return extractNotificationsData(candidate.payload);
  }

  throw new ApiError("Notifications response is invalid.", 500, "INVALID_RESPONSE");
}

export function parseNotificationDto(dto: unknown): Notification {
  if (!isObject(dto)) {
    throw new ApiError("Notification payload is invalid.", 500, "INVALID_RESPONSE");
  }

  const notificationDto = dto as Partial<NotificationDto>;

  return {
    id: asTrimmedString(notificationDto.id, "id"),
    title: asTrimmedString(notificationDto.title, "title"),
    message: asTrimmedString(notificationDto.message, "message"),
    type: asTrimmedString(notificationDto.type, "type"),
    severity: asTrimmedString(notificationDto.severity, "severity"),
    shouldToast: asBoolean(notificationDto.shouldToast, "shouldToast"),
    isRead: asBoolean(notificationDto.isRead, "isRead"),
    readAt: parseNullableDate(notificationDto.readAt, "readAt"),
    relatedEntityType: null,
    relatedEntityId: null,
    actionUrl: null,
    createdAt: parseDate(notificationDto.createdAt, "createdAt"),
  };
}

export function parseNotificationsResponse(response: unknown): Notification[] {
  return extractNotificationsData(response).map(parseNotificationDto);
}

export function parseUnreadCountResponse(response: unknown): number {
  if (typeof response === "number" && Number.isFinite(response)) {
    return Math.max(0, response);
  }

  if (isObject(response)) {
    const candidate =
      response.count ??
      response.unreadCount ??
      response.total ??
      response.data ??
      response.result ??
      response.payload;

    if (candidate !== response) {
      return parseUnreadCountResponse(candidate);
    }
  }

  throw new ApiError("Unread notifications count response is invalid.", 500, "INVALID_RESPONSE");
}

