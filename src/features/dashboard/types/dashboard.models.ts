export type DashboardTrend = {
  value: number;
  label: string;
  trend: "up" | "down" | "neutral";
};

export type DashboardExpenseBreakdownItem = {
  categoryName: string;
  amount: number;
  change: DashboardTrend;
};

export type DashboardMoneyFlowPoint = {
  label: string;
  income: number;
  expense: number;
  savings: number;
};

export type DashboardData = {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  rangeStart: Date;
  rangeEnd: Date;
  incomeChangePercentage: DashboardTrend;
  expenseChangePercentage: DashboardTrend;
  savingsChangePercentage: DashboardTrend;
  expenseBreakdown: DashboardExpenseBreakdownItem[];
  moneyFlow: DashboardMoneyFlowPoint[];
};

export type DashboardCardSummary = Pick<
  DashboardData,
  | "totalBalance"
  | "totalIncome"
  | "totalExpense"
  | "totalSavings"
  | "incomeChangePercentage"
  | "expenseChangePercentage"
  | "savingsChangePercentage"
>;
