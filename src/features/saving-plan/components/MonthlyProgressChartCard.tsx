import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, Text } from "../../../shared/ui";
import type { SavingPlanMonthlyProgressPoint } from "../types/saving-plan.types";
import {
  formatSavingPlanCurrency,
  formatSavingPlanPercentage,
} from "../utils/saving-plan.formatters";

type MonthlyProgressChartCardProps = {
  points: SavingPlanMonthlyProgressPoint[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
};

type TooltipPayload = {
  payload?: SavingPlanMonthlyProgressPoint;
  dataKey?: string;
  value?: number;
};

function getYAxisMax(points: SavingPlanMonthlyProgressPoint[]): number {
  const maxActual = Math.max(100, ...points.map((point) => point.actualProgress));
  return Math.max(120, Math.ceil(maxActual / 10) * 10);
}

function ProgressTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-xl border border-border bg-surface p-3 shadow-xl">
      <Text variant="body" weight="bold" className="text-text-primary">
        {point.label}
      </Text>
      <Text variant="caption" className="mt-1 block text-text-secondary">
        Actual: {formatSavingPlanPercentage(point.actualProgress)}
      </Text>
      <Text variant="caption" className="block text-text-secondary">
        Target: {formatSavingPlanPercentage(point.recommendedProgress)}
      </Text>
      <Text variant="caption" className="block text-text-secondary">
        Saving: {formatSavingPlanCurrency(point.actualSaving)}
      </Text>
    </div>
  );
}

function MonthlyProgressChartCard({
  points,
  isLoading,
  isError,
  errorMessage,
}: MonthlyProgressChartCardProps) {
  const yAxisMax = getYAxisMax(points);

  return (
    <Card padding="md" className="min-h-[360px] space-y-4">
      <div>
        <Text as="h2" variant="subtitle" weight="bold" className="text-text-primary">
          Monthly Progress
        </Text>
        <Text variant="caption" className="text-text-muted">
          {points.length > 0 ? `${points.length}-month trend` : "6-month trend"}
        </Text>
      </div>

      {isLoading && (
        <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
      )}

      {isError && !isLoading && (
        <Text variant="body" className="text-rose-600">
          {errorMessage ?? "Failed to load monthly progress."}
        </Text>
      )}

      {!isLoading && !isError && points.length === 0 && (
        <div className="flex h-64 items-center justify-center text-sm text-text-muted">
          No monthly progress data available yet.
        </div>
      )}

      {!isLoading && !isError && points.length > 0 && (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 16, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, yAxisMax]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={44}
              />
              <Tooltip content={<ProgressTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={28}
                iconType="circle"
                wrapperStyle={{
                  color: "var(--color-text-secondary)",
                  fontSize: 12,
                }}
              />
              <Line
                name="Actual Progress"
                type="monotone"
                dataKey="actualProgress"
                stroke="var(--color-primary)"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: "var(--color-surface)" }}
                activeDot={{ r: 5 }}
              />
              <Line
                name="Recommended"
                type="monotone"
                dataKey="recommendedProgress"
                stroke="var(--color-text-muted)"
                strokeDasharray="6 6"
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 2, fill: "var(--color-surface)" }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

export default MonthlyProgressChartCard;
