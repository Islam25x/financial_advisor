import type { DateRangeValue } from "../../shared/ui/DateRangeSelector";
import type { TransactionsApiTypeFilter } from "../../features/transactions/types/transactions-filter.types";

const DASHBOARD_QUERY_KEY = ["dashboard"] as const;
const TRANSACTIONS_QUERY_KEY = ["transactions"] as const;
const GOALS_QUERY_KEY = ["goals"] as const;
const SAVING_PLANS_QUERY_KEY = ["saving-plans"] as const;
const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;

export const queryKeys = {
  auth: {
    confirmEmail: (userId = "", token = "") =>
      ["auth", "confirm-email", userId, token] as const,
  },
  user: {
    profile: ["user", "profile"] as const,
  },
  dashboard: {
    all: DASHBOARD_QUERY_KEY,
    byRange: (selectedRange: DateRangeValue) =>
      [...DASHBOARD_QUERY_KEY, selectedRange] as const,
  },
  transactions: {
    all: TRANSACTIONS_QUERY_KEY,
    list: (
      selectedRange: DateRangeValue,
      type: TransactionsApiTypeFilter | null,
      categoryId: string | null,
      fromDate: string | null,
      toDate: string | null,
      pageNumber: number | undefined,
      pageSize: number,
    ) =>
      [
        ...TRANSACTIONS_QUERY_KEY,
        selectedRange,
        type,
        categoryId,
        fromDate,
        toDate,
        pageNumber,
        pageSize,
      ] as const,
    categories: ["transactions", "categories"] as const,
  },
  categories: {
    bill: ["categories", "bill"] as const,
  },
  goals: {
    all: GOALS_QUERY_KEY,
    list: (pageNumber: number, pageSize: number) =>
      [...GOALS_QUERY_KEY, pageNumber, pageSize] as const,
    detail: (goalId: string) => ["goal-detail", goalId] as const,
    history: (goalId: string, pageNumber: number, pageSize: number) =>
      ["goal-history", goalId, pageNumber, pageSize] as const,
    historyRoot: (goalId: string) => ["goal-history", goalId] as const,
  },
  savingPlans: {
    all: SAVING_PLANS_QUERY_KEY,
    active: [...SAVING_PLANS_QUERY_KEY, "active"] as const,
    activeProgress: ["saving-plan", "active", "progress"] as const,
    activeMonthlyProgress: ["saving-plan", "active", "monthly-progress"] as const,
    progress: [...SAVING_PLANS_QUERY_KEY, "progress"] as const,
    monthlyProgress: [...SAVING_PLANS_QUERY_KEY, "monthly-progress"] as const,
  },
  ai: {
    chatMessages: ["chat", "messages"] as const,
  },
  notifications: {
    all: NOTIFICATIONS_QUERY_KEY,
    listRoot: [...NOTIFICATIONS_QUERY_KEY, "list"] as const,
    list: (filters?: {
      isRead?: boolean;
      pageNumber?: number;
      pageSize?: number;
      sortDirection?: "Asc" | "Desc";
    }) =>
      [
        ...NOTIFICATIONS_QUERY_KEY,
        "list",
        filters?.isRead ?? null,
        filters?.pageNumber ?? null,
        filters?.pageSize ?? null,
        filters?.sortDirection ?? null,
      ] as const,
    unreadCount: [...NOTIFICATIONS_QUERY_KEY, "unread-count"] as const,
  },
} as const;
