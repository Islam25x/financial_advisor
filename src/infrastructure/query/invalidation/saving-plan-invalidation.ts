import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "../query-keys";

export async function invalidateSavingPlanActiveStateQueries(
  queryClient: QueryClient,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: queryKeys.savingPlans.active,
    }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.savingPlans.progress,
    }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.savingPlans.monthlyProgress,
    }),
  ]);
}

export async function invalidateSavingPlanProgressQueries(
  queryClient: QueryClient,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: queryKeys.savingPlans.progress,
    }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.savingPlans.monthlyProgress,
    }),
  ]);
}
