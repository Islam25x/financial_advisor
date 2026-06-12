import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { useAuth } from "../../../shared/auth/AuthContext";
import { getBillsApi } from "../api/bill.api";
import type { Bill } from "../types/bill.types";
import { parseBills } from "../utils/bill.parser";
import { billQueryKeys } from "./bill-query-keys";

export function useBills() {
  const { isAuthenticated } = useAuth();

  return useQuery<Bill[], ApiError>({
    queryKey: billQueryKeys.list,
    queryFn: async ({ signal }) => parseBills(await getBillsApi({ signal })),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}
