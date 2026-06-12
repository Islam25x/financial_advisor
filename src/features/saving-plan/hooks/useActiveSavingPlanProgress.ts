import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { queryKeys } from "../../../infrastructure/query/query-keys";
import { useAuth } from "../../../shared/auth/AuthContext";
import { getActiveSavingPlanProgressApi } from "../api/get-saving-plan-progress.api";
import type { SavingPlanCurrentProgress } from "../types/saving-plan.types";
import { parseSavingPlanCurrentProgress } from "../utils/saving-plan.parser";

export function useActiveSavingPlanProgress(): UseQueryResult<
  SavingPlanCurrentProgress | null,
  ApiError
> {
  const { isAuthenticated } = useAuth();

  return useQuery<SavingPlanCurrentProgress | null, ApiError>({
    queryKey: queryKeys.savingPlans.activeProgress,
    queryFn: async ({ signal }) =>
      parseSavingPlanCurrentProgress(await getActiveSavingPlanProgressApi({ signal })),
    enabled: isAuthenticated,
    staleTime: 1000 * 60,
  });
}
