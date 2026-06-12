import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { queryKeys } from "../../../infrastructure/query/query-keys";
import { useAuth } from "../../../shared/auth/AuthContext";
import { getActiveSavingPlanMonthlyProgressApi } from "../api/get-saving-plan-monthly-progress.api";
import type { SavingPlanMonthlyProgressPoint } from "../types/saving-plan.types";
import { parseSavingPlanMonthlyProgress } from "../utils/saving-plan.parser";

export function useActiveSavingPlanMonthlyProgress(): UseQueryResult<
  SavingPlanMonthlyProgressPoint[],
  ApiError
> {
  const { isAuthenticated } = useAuth();

  return useQuery<SavingPlanMonthlyProgressPoint[], ApiError>({
    queryKey: queryKeys.savingPlans.activeMonthlyProgress,
    queryFn: async ({ signal }) =>
      parseSavingPlanMonthlyProgress(await getActiveSavingPlanMonthlyProgressApi({ signal })),
    enabled: isAuthenticated,
    staleTime: 1000 * 60,
  });
}
