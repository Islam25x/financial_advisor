import type { DashboardCardSummary } from "../types/dashboard.models";
import type { FinancialSummaryData } from "../../../shared/utils/financial-summary";

export function mapDashboardCardSummaryToFinancialSummary(
  summary?: DashboardCardSummary,
): FinancialSummaryData | undefined {
  if (!summary) {
    return undefined;
  }

  return {
    availableBalance: summary.totalBalance,
    income: summary.totalIncome,
    expenses: summary.totalExpense,
    savings: summary.totalSavings,
    incomeTrend: summary.incomeChangePercentage,
    expensesTrend: summary.expenseChangePercentage,
    savingsTrend: summary.savingsChangePercentage,
  };
}
