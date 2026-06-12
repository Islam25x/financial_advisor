import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { queryKeys } from "../../../infrastructure/query/query-keys";
import { useAuth } from "../../../shared/auth/AuthContext";
import { getActiveSavingPlanApi } from "../api/get-active-saving-plan.api";
import type { SavingPlanResponseDto } from "../api/saving-plan.dto";
import { parseActiveSavingPlanResponse } from "../utils/saving-plan.parser";

export function useActiveSavingPlan(): UseQueryResult<SavingPlanResponseDto | null, ApiError> {
  const { isAuthenticated } = useAuth();

  return useQuery<SavingPlanResponseDto | null, ApiError>({
    queryKey: queryKeys.savingPlans.active,
    queryFn: async ({ signal }) => {
      const response = await getActiveSavingPlanApi({ signal });
      return parseActiveSavingPlanResponse(response);
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60,
  });
}
