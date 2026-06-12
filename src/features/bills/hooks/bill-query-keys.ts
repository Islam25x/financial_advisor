import type { BillOccurrenceFilters } from "../types/bill.types";

export const billQueryKeys = {
  all: ["bills"] as const,
  list: ["bills", "list"] as const,
  summary: ["bills", "summary"] as const,
  details: (billSeriesId: string) => ["bills", "details", billSeriesId] as const,
  calendar: (year: number, month: number) => ["bills", "calendar", year, month] as const,
  occurrences: (filters: BillOccurrenceFilters) =>
    [
      "bills",
      "occurrences",
      filters.search ?? "",
      filters.status ?? "all",
      filters.category ?? "all",
      filters.sortBy ?? "dueDate",
      filters.sortDirection ?? "asc",
      filters.pageNumber ?? 1,
      filters.pageSize ?? 6,
    ] as const,
};
