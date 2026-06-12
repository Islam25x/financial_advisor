import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { queryKeys } from "../../../infrastructure/query/query-keys";
import { useAuth } from "../../../shared/auth/AuthContext";
import { getSavingPlanProgressApi } from "../api/get-saving-plan-progress.api";
import type { SavingPlanProgressResponseDto } from "../api/saving-plan.dto";
import { parseSavingPlanProgressResponse } from "../utils/saving-plan.parser";

export function useSavingPlanProgress(): UseQueryResult<SavingPlanProgressResponseDto, ApiError> {
  const { isAuthenticated } = useAuth();

  return useQuery<SavingPlanProgressResponseDto, ApiError>({
    queryKey: queryKeys.savingPlans.progress,
    queryFn: async ({ signal }) => {
      const response = await getSavingPlanProgressApi({ signal });
      return parseSavingPlanProgressResponse(response);
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60,
  });
}
