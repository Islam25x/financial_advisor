import { useQuery } from "@tanstack/react-query";
import { fetchTransactionsApi } from "../api/transactions.api";
import {
  mapTransactionsResponseToPage,
  type TransactionsPage,
} from "../utils/transaction.parser";
import { ApiError } from "../../../infrastructure/api/api-error";
import { queryKeys } from "../../../infrastructure/query/query-keys";
import { useAuth } from "../../../shared/auth/AuthContext";
import { useDateRange } from "../../../shared/ui";
import type {
  TransactionsTypeUiFilter,
} from "../types/transactions-filter.types";

type UseTransactionsOptions = {
  typeFilter?: TransactionsTypeUiFilter;
  categoryId?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  pageNumber?: number;
  pageSize?: number;
};

export function useTransactions(options?: UseTransactionsOptions) {
  const { isAuthenticated } = useAuth();
  const { selectedRange } = useDateRange();
  const typeFilter = options?.typeFilter ?? "all";
  const type =
    typeFilter === "income"
      ? "Income"
      : typeFilter === "expense"
        ? "Expense"
        : null;
  const categoryId = options?.categoryId ?? null;
  const fromDate = options?.fromDate ?? null;
  const toDate = options?.toDate ?? null;
  const pageNumber = options?.pageNumber;
  const pageSize = 4;

  return useQuery<TransactionsPage, ApiError>({
    queryKey: queryKeys.transactions.list(
      selectedRange,
      type,
      categoryId,
      fromDate,
      toDate,
      pageNumber,
      pageSize,
    ),
    queryFn: async ({ signal }) => {
      const response = await fetchTransactionsApi(
        selectedRange,
        type,
        categoryId,
        fromDate,
        toDate,
        pageNumber,
        pageSize,
        {
          signal,
        },
      );

      try {
        return mapTransactionsResponseToPage(response);
      } catch (error) {
        throw new ApiError("Invalid transactions response.", 500, "INVALID_RESPONSE", undefined, error);
      }
    },
    staleTime: 30_000,
    enabled: isAuthenticated,
  });
}
