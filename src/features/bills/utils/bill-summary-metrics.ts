import type { FinancialSummaryData } from "../../../shared/utils/financial-summary";
import type { BillSummary } from "../types/bill.types";

export function mapBillSummaryToFinancialSummary(
  summary?: BillSummary,
): FinancialSummaryData | undefined {
  if (!summary) return undefined;

  return {
    availableBalance: summary.totalBills,
    income: summary.dueThisWeek,
    expenses: summary.paidThisMonth,
    savings: summary.overdue,
    balanceTrend: { value: 0, trend: "neutral" },
    incomeTrend: { value: summary.dueThisWeek, trend: "neutral" },
    expensesTrend: { value: summary.paidThisMonth, trend: "up" },
    savingsTrend: { value: summary.overdue, trend: summary.overdue > 0 ? "down" : "neutral" },
  };
}
