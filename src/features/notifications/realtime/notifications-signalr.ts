import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  type HubConnection,
} from "@microsoft/signalr";
import { getAppApiBaseUrl } from "../../../infrastructure/api/api-config";
import { getAuthSessionSnapshot } from "../../../infrastructure/auth/auth-session-store";

const DEFAULT_NOTIFICATIONS_HUB_PATH = "/hubs/notifications";

export function getNotificationsHubUrl(): string {
  const configuredUrl = import.meta.env.VITE_FINEXA_NOTIFICATIONS_HUB_URL?.trim();

  if (configuredUrl) {
    return configuredUrl;
  }

  return `${getAppApiBaseUrl()}${DEFAULT_NOTIFICATIONS_HUB_PATH}`;
}

export function createNotificationsConnection(): HubConnection {
  return new HubConnectionBuilder()
    .withUrl(getNotificationsHubUrl(), {
      accessTokenFactory: () => getAuthSessionSnapshot()?.token ?? "",
    })
    .withAutomaticReconnect()
    .configureLogging(import.meta.env.DEV ? LogLevel.Warning : LogLevel.None)
    .build();
}

export async function stopNotificationsConnection(connection: HubConnection): Promise<void> {
  if (connection.state !== HubConnectionState.Disconnected) {
    await connection.stop();
  }
}

