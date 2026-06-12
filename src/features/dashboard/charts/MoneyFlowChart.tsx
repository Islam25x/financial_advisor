import { memo } from "react";
import LineChartBase from "../../../shared/chart/LineChartBase";
import { Button, Card, Text } from "../../../shared/ui";
import { useDashboard } from "../hooks/useDashboard";
import { EmptyMoneyFlowState } from "./EmptyMoneyFlowState";
import { useDateRange } from "../../../shared/ui";

const chartSeries = [
  {
    dataKey: "income",
    stroke: "#0ea5e9",
    fill: "rgba(139,92,246,0.15)",
  },
  {
    dataKey: "expense",
    stroke: "#F43F5E",
    fill: "rgba(244,63,94,0.15)",
  },
  {
    dataKey: "savings",
    stroke: "#6366F1",
    fill: "rgba(99,102,241,0.15)",
  },
] as const;

const legendItems = [
  { label: "Income", color: "#0ea5e9" },
  { label: "Expenses", color: "#F43F5E" },
  { label: "Savings", color: "#6366F1" },
] as const;

const MoneyFlowChart = () => {
  const { data: dashboard } = useDashboard();

  const { selectedRange } = useDateRange();

  console.log(dashboard);
  
  const chartData = dashboard?.moneyFlow ?? [];
  const hasEnoughChartData =
    chartData.length >= 3 &&
    chartData.some(
      item =>
        item.income > 0 ||
        item.expense > 0 ||
        item.savings > 0
    );
  return (
    <Card variant="default" padding="sm" className="relative w-full h-80 flex flex-col p-0">
      <div className="flex items-center justify-between my-4 mx-6">
        <Text as="h2" variant="subtitle" weight="medium" className="text-gray-900 my-1">
          Money Flow
        </Text>
        {!hasEnoughChartData && <EmptyMoneyFlowState />}
        <div className="flex items-center gap-4">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <Text as="span" variant="body" weight="medium" className="text-gray-700">
                {item.label}
              </Text>
            </div>
          ))}

          <Button
            variant="secondary"
            size="sm"
            className="px-3 py-1 rounded-full text-sm text-gray-600 border-gray-200"
          >
            {selectedRange}
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-15 px-6 pb-6">
        <LineChartBase data={chartData} series={[...chartSeries]} />
      </div>
    </Card>
  );
};

export default memo(MoneyFlowChart);
