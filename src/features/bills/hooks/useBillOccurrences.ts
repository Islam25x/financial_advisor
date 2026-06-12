import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { useAuth } from "../../../shared/auth/AuthContext";
import { getBillOccurrencesApi } from "../api/bill.api";
import type { BillOccurrenceFilters, BillOccurrencesPage } from "../types/bill.types";
import { parseBillOccurrencesPage } from "../utils/bill.parser";
import { billQueryKeys } from "./bill-query-keys";

export function useBillOccurrences(filters: BillOccurrenceFilters) {
  const { isAuthenticated } = useAuth();

  return useQuery<BillOccurrencesPage, ApiError>({
    queryKey: billQueryKeys.occurrences(filters),
    queryFn: async ({ signal }) =>
      parseBillOccurrencesPage(await getBillOccurrencesApi(filters, { signal })),
    staleTime: 30_000,
    enabled: isAuthenticated,
  });
}
