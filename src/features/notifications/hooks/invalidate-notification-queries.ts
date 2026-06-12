import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../infrastructure/query/query-keys";

export async function invalidateNotificationQueries(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list }),
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount }),
  ]);
}

