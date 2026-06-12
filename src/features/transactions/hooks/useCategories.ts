import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getCategoriesApi } from "../api/get-categories.api";
import type { TransactionCategory } from "../types/category.types";
import { parseCategories } from "../utils/category.parser";
import { ApiError } from "../../../infrastructure/api/api-error";
import { queryKeys } from "../../../infrastructure/query/query-keys";
import { useAuth } from "../../../shared/auth/AuthContext";

export const TRANSACTION_CATEGORIES_QUERY_KEY = queryKeys.transactions.categories;

type UseCategoriesOptions = {
  enabled?: boolean;
};

export function useCategories(
  options?: UseCategoriesOptions,
): UseQueryResult<TransactionCategory[], ApiError> {
  const { isAuthenticated } = useAuth();

  return useQuery<TransactionCategory[], ApiError>({
    queryKey: TRANSACTION_CATEGORIES_QUERY_KEY,
    queryFn: async ({ signal }) => {
      const response = await getCategoriesApi({
        signal,
      });

      return parseCategories(response);
    },
    staleTime: 1000 * 60,
    enabled: (options?.enabled ?? true) && isAuthenticated,
  });
}
