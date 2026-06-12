export interface DashboardTrendDto {
  value: number;
  label: string;
  trend: "up" | "down" | "stable" | "neutral";
}

export interface ExpenseBreakdownDto {
  categoryName: string;
  amount: number;
  change: DashboardTrendDto;
}

export interface MoneyFlowDto {
  label: string;
  income: number;
  expense: number;
}

export interface DashboardResponseDto {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  from: string;
  to: string;
  incomeChangePercentage: DashboardTrendDto;
  expenseChangePercentage: DashboardTrendDto;
  savingsChangePercentage: DashboardTrendDto;
  expenseBreakdown: ExpenseBreakdownDto[];
  moneyFlow: MoneyFlowDto[];
}
