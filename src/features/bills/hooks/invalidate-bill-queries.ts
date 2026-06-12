import type { QueryClient } from "@tanstack/react-query";
import { billQueryKeys } from "./bill-query-keys";

export async function invalidateBillQueries(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: billQueryKeys.list }),
    queryClient.invalidateQueries({ queryKey: billQueryKeys.summary }),
    queryClient.invalidateQueries({ queryKey: ["bills", "calendar"] }),
    queryClient.invalidateQueries({ queryKey: ["bills", "occurrences"] }),
  ]);
}
