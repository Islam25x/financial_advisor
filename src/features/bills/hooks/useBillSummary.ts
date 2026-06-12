import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { useAuth } from "../../../shared/auth/AuthContext";
import { getBillSummaryApi } from "../api/bill.api";
import type { BillSummary } from "../types/bill.types";
import { parseBillSummary } from "../utils/bill.parser";
import { billQueryKeys } from "./bill-query-keys";

export function useBillSummary() {
  const { isAuthenticated } = useAuth();

  return useQuery<BillSummary, ApiError>({
    queryKey: billQueryKeys.summary,
    queryFn: async ({ signal }) => parseBillSummary(await getBillSummaryApi({ signal })),
    staleTime: 30_000,
    enabled: isAuthenticated,
  });
}
