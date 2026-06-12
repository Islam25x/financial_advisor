import { memo, useMemo } from "react";
import type { CSSProperties } from "react";
import DoughnutChartBase from "../../../shared/chart/DoughnutChartBase";
import type {
  DoughnutChartInputData,
  DoughnutChartInputOptions,
} from "../../../shared/chart/DoughnutChartBase";
import { Card, Text } from "../../../shared/ui";
import { useDashboard } from "../hooks/useDashboard";
import type { DashboardExpenseBreakdownItem } from "../types/dashboard.models";

const CHART_COLORS = [
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#8B5CF6",
];

const EMPTY_EXPENSE_BREAKDOWN: DashboardExpenseBreakdownItem[] = [];

const amountFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const BudgetDoughnutChart = memo(() => {
  const { data: dashboard } = useDashboard();

  const expenseBreakdown = dashboard?.expenseBreakdown ?? EMPTY_EXPENSE_BREAKDOWN;

  const totalExpenses = dashboard?.totalExpense ?? 0;

  const hasExpenseData = expenseBreakdown.length > 0;

  const formattedTotalExpenses = useMemo(
    () => amountFormatter.format(totalExpenses),
    [totalExpenses],
  );

  const data = useMemo<DoughnutChartInputData>(
    () => ({
      labels: expenseBreakdown.map((item) => item.categoryName),

      datasets: [
        {
          data: expenseBreakdown.map((item) => item.amount),

          backgroundColor: expenseBreakdown.map(
            (_, index) => CHART_COLORS[index % CHART_COLORS.length],
          ),

          borderColor: "#ffffff",
          borderWidth: 2,
          cutout: "82%",
          borderRadius: 5,
        },
      ],
    }),
    [expenseBreakdown],
  );

  const options = useMemo<DoughnutChartInputOptions>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false,
        },

        tooltip: {
          enabled: true,
        },
      },
    }),
    [],
  );

  const legendItems = useMemo(
    () =>
      expenseBreakdown.map((item, index) => {
        const color = CHART_COLORS[index % CHART_COLORS.length];
        const percentage =
          totalExpenses > 0
            ? Math.round((item.amount / totalExpenses) * 100)
            : 0;

        return {
          label: item.categoryName,
          value: item.amount,
          percentage,
          color,

          dotStyle: {
            backgroundColor: color,
          } as CSSProperties,
          percentageStyle: {
            color,
            borderColor: `${color}25`,
            backgroundColor: `${color}10`,
          } as CSSProperties,
        };
      }),
    [expenseBreakdown, totalExpenses],
  );

  return (
    <Card
      variant="default"
      padding="md"
      className="relative overflow-hidden flex h-full w-full flex-col gap-5 lg:flex-row"
    >
      <div className="flex flex-1 flex-col">
        <Text
          as="h2"
          variant="subtitle"
          weight="bold"
          className="mb-3 text-slate-900"
        >
          Expense Breakdown
        </Text>

        {legendItems.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <Text variant="body" className="text-[10px] text-slate-500">
              No expense data available
            </Text>
          </div>
        ) : (
          <ul className="scrollbar-clean max-h-55 space-y-1.5 overflow-y-auto overflow-x-hidden pr-1.5">
            {legendItems.map((item, index) => (
              <li
                key={`${item.label}-${index}`}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-2.5 py-1.5"
              >
                <div className="flex min-w-0 items-center gap-1.5">
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={item.dotStyle}
                  />

                  <span className="truncate text-[11px] font-medium text-slate-700">
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold text-slate-900">
                    {amountFormatter.format(item.value)}
                  </span>

                  <span
                    className="rounded-md border px-1.5 py-[2px] text-[9px] font-semibold"
                    style={item.percentageStyle}
                  >
                    {item.percentage}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="relative z-10">
            <DoughnutChartBase
              data={data}
              options={options}
              width={160}
              height={160}
            />
          </div>

          <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center">
            <span className="text-[10px] font-medium text-slate-500">
              Expenses
            </span>

            <span className="text-lg font-bold tracking-tight text-slate-900">
              {formattedTotalExpenses}
            </span>
          </div>
        </div>
      </div>

      {!hasExpenseData && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs">
          <Text
            variant="subtitle"
            className="text-gray-800"
          >
            Not enough expense history
          </Text>

          <Text
            variant="body"
            className="mt-2 max-w-[260px] text-center text-white text-sm mb-4"
          >
            Add transactions to unlock expense insights and category analytics.
          </Text>
        </div>
      )}
    </Card>
  );
});

BudgetDoughnutChart.displayName = "BudgetDoughnutChart";

export default BudgetDoughnutChart;
