import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "../query-keys";
import { invalidateTransactionDomainQueries } from "./transaction-invalidation";

type InvalidateGoalDomainQueriesOptions = {
  goalId?: string;
  includeTransactionEffects?: boolean;
};

export async function invalidateGoalDomainQueries(
  queryClient: QueryClient,
  options?: InvalidateGoalDomainQueriesOptions,
): Promise<void> {
  const operations = [
    queryClient.invalidateQueries({
      queryKey: queryKeys.goals.all,
    }),
  ];

  const normalizedGoalId = options?.goalId?.trim();

  if (normalizedGoalId) {
    operations.push(
      queryClient.invalidateQueries({
        queryKey: queryKeys.goals.detail(normalizedGoalId),
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.goals.historyRoot(normalizedGoalId),
      }),
    );
  }

  await Promise.all(operations);

  if (options?.includeTransactionEffects) {
    await invalidateTransactionDomainQueries(queryClient);
  }
}
