import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { useAuth } from "../../../shared/auth/AuthContext";
import { getBillCalendarApi } from "../api/bill.api";
import type { BillCalendarOccurrence } from "../types/bill.types";
import { parseBillCalendar } from "../utils/bill.parser";
import { billQueryKeys } from "./bill-query-keys";

export function useBillCalendar(year: number, month: number) {
  const { isAuthenticated } = useAuth();

  return useQuery<BillCalendarOccurrence[], ApiError>({
    queryKey: billQueryKeys.calendar(year, month),
    queryFn: async ({ signal }) =>
      parseBillCalendar(await getBillCalendarApi(year, month, { signal })),
    staleTime: 30_000,
    enabled: isAuthenticated,
  });
}
