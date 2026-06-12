import { getAppApiBaseUrl } from "../../../infrastructure/api/api-config";
import { requestJson } from "../../../infrastructure/api/http";
import type {
  BillOccurrenceFilters,
  CreateBillInput,
  OccurrenceNotesInput,
  RecordBillPaymentInput,
  TopUpBillInput,
  UpdateBillInput,
} from "../types/bill.types";

export async function getBillSummaryApi(
  options?: { signal?: AbortSignal },
): Promise<unknown> {
  return requestJson<unknown>("/api/Bill/dashboard-summary", {
    method: "GET",
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
    withAuth: true,
  });
}

export async function getBillCalendarApi(
  year: number,
  month: number,
  options?: { signal?: AbortSignal },
): Promise<unknown> {
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
  });

  return requestJson<unknown>(`/api/Bill/calendar?${params.toString()}`, {
    method: "GET",
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
    withAuth: true,
  });
}

export async function getBillsApi(
  options?: { signal?: AbortSignal },
): Promise<unknown> {
  return requestJson<unknown>("/api/Bill", {
    method: "GET",
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
    withAuth: true,
  });
}

export async function getBillOccurrencesApi(
  filters: BillOccurrenceFilters,
  options?: { signal?: AbortSignal },
): Promise<unknown> {
  const params = new URLSearchParams();

  if (filters.search?.trim()) params.set("Search", filters.search.trim());
  if (filters.status && filters.status !== "all") params.set("Status", filters.status);
  if (filters.category && filters.category !== "all") params.set("Category", filters.category);
  if (filters.fromDate) params.set("FromDate", filters.fromDate);
  if (filters.toDate) params.set("ToDate", filters.toDate);
  if (filters.sortBy) params.set("SortBy", filters.sortBy);
  if (filters.sortDirection) params.set("SortDirection", filters.sortDirection);
  if (filters.pageNumber) params.set("PageNumber", String(filters.pageNumber));
  params.set("PageSize", String(filters.pageSize ?? 6));

  return requestJson<unknown>(`/api/Bill/occurrences?${params.toString()}`, {
    method: "GET",
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
    withAuth: true,
  });
}

export async function recordBillPaymentApi(
  input: RecordBillPaymentInput,
  options?: { signal?: AbortSignal },
): Promise<void> {
  return requestJson<void>(
    `/api/Bill/occurrences/${encodeURIComponent(input.occurrenceId)}/record-payment`,
    {
      method: "POST",
      signal: options?.signal,
      baseUrl: getAppApiBaseUrl(),
      withAuth: true,
      body: JSON.stringify({
        amount: input.amount,
        paidAt: input.paidAt,
        notes: input.notes || null,
      }),
    },
  );
}

export async function createBillApi(
  input: CreateBillInput,
  options?: { signal?: AbortSignal },
): Promise<void> {
  return requestJson<void>("/api/Bill", {
    method: "POST",
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
    withAuth: true,
    body: JSON.stringify(input),
  });
}

export async function getBillDetailsApi(
  billSeriesId: string,
  options?: { signal?: AbortSignal },
): Promise<unknown> {
  return requestJson<unknown>(`/api/Bill/${encodeURIComponent(billSeriesId)}`, {
    method: "GET",
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
    withAuth: true,
  });
}

export async function updateBillApi(
  billSeriesId: string,
  input: UpdateBillInput,
  options?: { signal?: AbortSignal },
): Promise<void> {
  return requestJson<void>(`/api/Bill/${encodeURIComponent(billSeriesId)}`, {
    method: "PUT",
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
    withAuth: true,
    body: JSON.stringify(input),
  });
}

export async function skipBillOccurrenceApi(
  input: OccurrenceNotesInput,
  options?: { signal?: AbortSignal },
): Promise<void> {
  const params = new URLSearchParams();
  if (input.notes?.trim()) params.set("notes", input.notes.trim());
  const query = params.toString();

  return requestJson<void>(
    `/api/Bill/occurrences/${encodeURIComponent(input.occurrenceId)}/skip${query ? `?${query}` : ""}`,
    {
      method: "POST",
      signal: options?.signal,
      baseUrl: getAppApiBaseUrl(),
      withAuth: true,
    },
  );
}

export async function cancelBillOccurrenceApi(
  input: OccurrenceNotesInput,
  options?: { signal?: AbortSignal },
): Promise<void> {
  const params = new URLSearchParams();
  if (input.notes?.trim()) params.set("notes", input.notes.trim());
  const query = params.toString();

  return requestJson<void>(
    `/api/Bill/occurrences/${encodeURIComponent(input.occurrenceId)}/cancel${query ? `?${query}` : ""}`,
    {
      method: "POST",
      signal: options?.signal,
      baseUrl: getAppApiBaseUrl(),
      withAuth: true,
    },
  );
}

export async function deleteBillSeriesApi(
  billSeriesId: string,
  options?: { signal?: AbortSignal },
): Promise<void> {
  return requestJson<void>(`/api/Bill/${encodeURIComponent(billSeriesId)}`, {
    method: "DELETE",
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
    withAuth: true,
  });
}

export async function reverseBillPaymentApi(
  paymentId: string,
  options?: { signal?: AbortSignal },
): Promise<void> {
  return requestJson<void>(
    `/api/Bill/payments/${encodeURIComponent(paymentId)}/reverse`,
    {
      method: "POST",
      signal: options?.signal,
      baseUrl: getAppApiBaseUrl(),
      withAuth: true,
    },
  );
}

export async function topUpBillApi(
  input: TopUpBillInput,
  options?: { signal?: AbortSignal },
): Promise<void> {
  return requestJson<void>(
    `/api/Bill/${encodeURIComponent(input.billSeriesId)}/top-up`,
    {
      method: "POST",
      signal: options?.signal,
      baseUrl: getAppApiBaseUrl(),
      withAuth: true,
      body: JSON.stringify({
        amount: input.amount,
        paidAt: input.paidAt,
        notes: input.notes,
      }),
    },
  );
}
