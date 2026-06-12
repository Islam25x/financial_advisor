import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { queryKeys } from "../../../infrastructure/query/query-keys";
import { useAuth } from "../../../shared/auth/AuthContext";
import { getBillCategoriesApi } from "../api/get-categories.api";
import type { TransactionCategory } from "../types/category.types";
import { parseCategories } from "../utils/category.parser";

type UseBillCategoriesOptions = {
  enabled?: boolean;
};

export const BILL_CATEGORIES_QUERY_KEY = queryKeys.categories.bill;

export function useBillCategories(
  options?: UseBillCategoriesOptions,
): UseQueryResult<TransactionCategory[], ApiError> {
  const { isAuthenticated } = useAuth();

  return useQuery<TransactionCategory[], ApiError>({
    queryKey: BILL_CATEGORIES_QUERY_KEY,
    queryFn: async ({ signal }) => {
      const response = await getBillCategoriesApi({ signal });

      return parseCategories(response).filter((category) => category.isBillCategory);
    },
    staleTime: 1000 * 60,
    enabled: (options?.enabled ?? true) && isAuthenticated,
  });
}
