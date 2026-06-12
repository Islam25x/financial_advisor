import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { queryKeys } from "../../../infrastructure/query/query-keys";
import { useAuth } from "../../../shared/auth/AuthContext";
import { useDateRange } from "../../../shared/ui";
import { getDashboardApi } from "../api/get-dashboard.api";
import type { DashboardCardSummary, DashboardData } from "../types/dashboard.models";
import { parseDashboardSummary } from "../utils/dashboard.parser";

export const DASHBOARD_QUERY_KEY = queryKeys.dashboard.all;
export const DASHBOARD_SUMMARY_QUERY_KEY = DASHBOARD_QUERY_KEY;

function logDashboardDebug(message: string, payload?: unknown): void {
  if (!import.meta.env.DEV) {
    return;
  }

  console.debug(`[dashboard] ${message}`, payload);
}

function useDashboardQuery<TData>(
  select: (dashboard: DashboardData) => TData,
): UseQueryResult<TData, ApiError> {
  const { isAuthenticated } = useAuth();
  const { selectedRange } = useDateRange();

  return useQuery<DashboardData, ApiError, TData>({
    queryKey: queryKeys.dashboard.byRange(selectedRange),
    queryFn: async ({ signal }) => {
      const response = await getDashboardApi(selectedRange, {
        signal,
      });

      logDashboardDebug("Raw dashboard API response", response);

      const parsedDashboard = parseDashboardSummary(response);
      logDashboardDebug("Dashboard query parsed successfully", parsedDashboard);

      return parsedDashboard;
    },
    select,
    staleTime: 30_000,
    enabled: isAuthenticated,
  });
}

export function useDashboard(): UseQueryResult<DashboardData, ApiError> {
  return useDashboardQuery((dashboard) => dashboard);
}

export function useDashboardSummary(): UseQueryResult<DashboardCardSummary, ApiError> {
  return useDashboardQuery((dashboard) => ({
    totalBalance: dashboard.totalBalance,
    totalIncome: dashboard.totalIncome,
    totalExpense: dashboard.totalExpense,
    totalSavings: dashboard.totalSavings,
    incomeChangePercentage: dashboard.incomeChangePercentage,
    expenseChangePercentage: dashboard.expenseChangePercentage,
    savingsChangePercentage: dashboard.savingsChangePercentage,
  }));
}
