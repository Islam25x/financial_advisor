import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { useAuth } from "../../../shared/auth/AuthContext";
import { getBillDetailsApi } from "../api/bill.api";
import type { BillDetails } from "../types/bill.types";
import { parseBillDetails } from "../utils/bill.parser";
import { billQueryKeys } from "./bill-query-keys";

export function useBillDetails(billSeriesId: string | null, enabled: boolean) {
  const { isAuthenticated } = useAuth();

  return useQuery<BillDetails, ApiError>({
    queryKey: billQueryKeys.details(billSeriesId ?? ""),
    queryFn: async ({ signal }) => {
      if (!billSeriesId) {
        throw new ApiError("Bill series id is required.", 400, "INVALID_RESPONSE");
      }

      return parseBillDetails(await getBillDetailsApi(billSeriesId, { signal }));
    },
    enabled: enabled && isAuthenticated && Boolean(billSeriesId),
    staleTime: 30_000,
  });
}
