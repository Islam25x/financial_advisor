import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { queryKeys } from "../../../infrastructure/query/query-keys";
import { useAuth } from "../../../shared/auth/AuthContext";
import { getSavingPlanMonthlyProgressApi } from "../api/get-saving-plan-monthly-progress.api";
import type { SavingPlanMonthlyProgressResponseDto } from "../api/saving-plan.dto";
import { parseSavingPlanMonthlyProgressResponse } from "../utils/saving-plan.parser";

export function useSavingPlanMonthlyProgress(): UseQueryResult<
  SavingPlanMonthlyProgressResponseDto,
  ApiError
> {
  const { isAuthenticated } = useAuth();

  return useQuery<SavingPlanMonthlyProgressResponseDto, ApiError>({
    queryKey: queryKeys.savingPlans.monthlyProgress,
    queryFn: async ({ signal }) => {
      const response = await getSavingPlanMonthlyProgressApi({ signal });
      return parseSavingPlanMonthlyProgressResponse(response);
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60,
  });
}
