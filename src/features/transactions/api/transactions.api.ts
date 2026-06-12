import { getAppApiBaseUrl } from "../../../infrastructure/api/api-config";
import { requestJson } from "../../../infrastructure/api/http";
import type {
  TransactionsApiTypeFilter,
  TransactionsFilters,
} from "../types/transactions-filter.types";

function buildTransactionsQuery(
  period: TransactionsFilters["period"],
  type: TransactionsApiTypeFilter | null | undefined,
  categoryId: string | null | undefined,
  fromDate: string | null | undefined,
  toDate: string | null | undefined,
  pageNumber: number | undefined,
  pageSize: number,
): string {
  const params = new URLSearchParams();

  if (period) {
    params.set("Period", period);
  }

  if (type) {
    params.set("type", type);
  }

  if (categoryId) {
    params.set("categoryId", categoryId);
  }

  if (fromDate) {
    params.set("fromDate", fromDate);
  }

  if (toDate) {
    params.set("toDate", toDate);
  }

  if (typeof pageNumber === "number") {
    params.set("pageNumber", String(pageNumber));
  }

  params.set("PageSize", String(pageSize));

  const queryString = params.toString();
  return queryString ? `/api/Transaction/get-transactions?${queryString}` : "/api/Transaction/get-transactions";
}

export async function fetchTransactionsApi(
  period: TransactionsFilters["period"],
  type: TransactionsApiTypeFilter | null | undefined,
  categoryId: string | null | undefined,
  fromDate: string | null | undefined,
  toDate: string | null | undefined,
  pageNumber: number | undefined,
  pageSize: number,
  options?: { signal?: AbortSignal },
): Promise<unknown> {
  return requestJson<unknown>(
    buildTransactionsQuery(period, type, categoryId, fromDate, toDate, pageNumber, pageSize),
    {
      method: "GET",
      signal: options?.signal,
      baseUrl: getAppApiBaseUrl(),
      withAuth: true,
    },
  );
}
