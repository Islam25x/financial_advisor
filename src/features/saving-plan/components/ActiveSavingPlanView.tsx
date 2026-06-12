import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Lightbulb,
  PiggyBank,
  Power,
  Sparkles,
  Wallet,
} from "lucide-react";
import type { SavingPlanResponseDto } from "../api/saving-plan.dto";
import { useActiveSavingPlanMonthlyProgress } from "../hooks/useActiveSavingPlanMonthlyProgress";
import { useActiveSavingPlanProgress } from "../hooks/useActiveSavingPlanProgress";
import {
  formatRecommendationAmount,
  formatSavingPlanCurrency,
  formatSavingPlanDate,
  formatSavingPlanDuration,
} from "../utils/saving-plan.formatters";
import { Button, Card, PageHeader, Text, TopHeaderBar, cn } from "../../../shared/ui";
import MonthlyProgressChartCard from "./MonthlyProgressChartCard";
import ThisMonthProgressCard from "./ThisMonthProgressCard";

type ActiveSavingPlanViewProps = {
  plan: SavingPlanResponseDto;
  onDeactivateClick: () => void;
};

function PlanDetailRow({
  icon: Icon,
  label,
  value,
  badgeTone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  badgeTone?: "success";
}) {
  return (
    <div className="grid grid-cols-[24px_minmax(0,160px)_1fr] items-center gap-3 text-sm">
      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon size={14} aria-hidden="true" />
      </span>
      <Text as="span" variant="body" className="text-text-secondary">
        {label}
      </Text>
      {badgeTone ? (
        <span className="w-fit rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
          {value}
        </span>
      ) : (
        <Text as="span" variant="body" className="text-text-primary">
          {value}
        </Text>
      )}
    </div>
  );
}

function ForecastRow({
  icon: Icon,
  label,
  current,
  forecast,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  current: string;
  forecast: string;
  tone: string;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_120px_120px] items-center  border-t border-border py-4 text-sm">
      <div className="flex items-center gap-3">
        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", tone)}>
          <Icon size={16} aria-hidden="true" />
        </span>
        <Text as="span" variant="body" weight="bold" className="text-text-primary">
          {label}
        </Text>
      </div>
      <Text as="span" variant="body" weight="bold" className="text-text-primary">
        {current}
      </Text>
      <Text as="span" variant="body" weight="bold" className="text-emerald-600">
        {forecast}
      </Text>
    </div>
  );
}

function ActiveSavingPlanView({ plan, onDeactivateClick }: ActiveSavingPlanViewProps) {
  const hasExtraSaving =
    plan.ExtraSavingOpportunity !== undefined && plan.ExtraSavingOpportunity > 0;
  const currentProgressQuery = useActiveSavingPlanProgress();
  const monthlyProgressQuery = useActiveSavingPlanMonthlyProgress();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Active Saving Plan"
        subtitle="You're on track to achieve your goal. Keep going!"
        right={
          <div className="flex flex-col gap-3 lg:items-end">
            <TopHeaderBar />
            <Button
              type="button"
              variant="secondary"
              size="md"
              className="border-rose-300 text-rose-600 hover:bg-rose-50"
              onClick={onDeactivateClick}
            >
              <Power size={16} aria-hidden="true" />
              Deactivate Plan
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card padding="md" className="space-y-5">
          <Text as="h2" variant="subtitle" weight="bold" className="text-text-primary">
            Plan Summary
          </Text>
          {plan.SummaryMessage && (
            <div className="flex gap-4 rounded-xl border border-primary/10 bg-primary/5 p-4">
              <Sparkles size={22} className="mt-1 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <Text variant="body" weight="bold" className="text-primary">
                  {plan.SummaryMessage}
                </Text>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <PlanDetailRow icon={BadgeCheck} label="Plan Type" value={plan.PlanType} />
            <PlanDetailRow
              icon={CalendarDays}
              label="Analysis Period"
              value={formatSavingPlanDuration(plan.AnalysisPeriodMonths)}
            />
            <PlanDetailRow
              icon={CheckCircle2}
              label="Status"
              value={plan.Status ?? "-"}
              badgeTone={plan.Status ? "success" : undefined}
            />
            <PlanDetailRow
              icon={CalendarDays}
              label="Applied At"
              value={formatSavingPlanDate(plan.AppliedAt)}
            />
            <PlanDetailRow
              icon={CalendarDays}
              label="Start Date"
              value={formatSavingPlanDate(plan.StartDate)}
            />
            <PlanDetailRow
              icon={CalendarDays}
              label="End Date"
              value={formatSavingPlanDate(plan.EndDate)}
            />
          </div>
        </Card>

        <Card padding="md">
          <Text as="h2" variant="subtitle" weight="bold" className="text-text-primary">
            Financial Forecast
          </Text>
          <div className="mt-5 grid grid-cols-[minmax(0,1fr)_120px_120px] gap-4 text-sm text-text-secondary">
            <span />
            <Text as="span" variant="body" className="text-text-secondary">
              Current
            </Text>
            <Text as="span" variant="body" className="text-text-secondary">
              Forecast
            </Text>
          </div>
          <div className="mt-2">
            <ForecastRow
              icon={Wallet}
              label="Income"
              current={formatSavingPlanCurrency(plan.AverageIncome)}
              forecast={formatSavingPlanCurrency(plan.ForecastedIncome)}
              tone="bg-sky-100 text-primary"
            />
            <ForecastRow
              icon={Wallet}
              label="Expenses"
              current={formatSavingPlanCurrency(plan.AverageExpenses)}
              forecast={formatSavingPlanCurrency(plan.ForecastedExpenses)}
              tone="bg-rose-100 text-rose-600"
            />
            <ForecastRow
              icon={Wallet}
              label="Saving"
              current={formatSavingPlanCurrency(plan.CurrentAverageSaving)}
              forecast={formatSavingPlanCurrency(plan.ForecastedSaving)}
              tone="bg-emerald-100 text-emerald-600"
            />
          </div>
        </Card>

        <ThisMonthProgressCard
          progress={currentProgressQuery.data}
          isLoading={currentProgressQuery.isLoading}
          isError={currentProgressQuery.isError}
          errorMessage={currentProgressQuery.error?.message}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card padding="md">
          <div className="flex items-center gap-3">
            <Lightbulb size={20} className="text-primary" aria-hidden="true" />
            <Text as="h2" variant="subtitle" weight="bold" className="text-text-primary">
              Plan Insights
            </Text>
          </div>
          {plan.Insights.length > 0 ? (
            <div className="mt-4 space-y-3">
              {plan.Insights.map((insight) => (
                <div key={insight} className="flex gap-3 rounded-xl border border-border bg-surface p-3 text-sm text-text-secondary">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-border bg-surface p-4 text-sm text-text-muted">
              No insights available yet.
            </div>
          )}
        </Card>

        <Card padding="md">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-rose-600" aria-hidden="true" />
            <Text as="h2" variant="subtitle" weight="bold" className="text-text-primary">
              Warnings
            </Text>
          </div>
          {plan.Warnings.length > 0 ? (
            <div className="mt-4 space-y-3">
              {plan.Warnings.map((warning) => (
                <div key={warning} className="flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-text-secondary">
                  <AlertTriangle size={18} className="mt-0.5 shrink-0 text-rose-600" aria-hidden="true" />
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-border bg-surface p-4 text-sm text-text-muted">
              No warnings right now.
            </div>
          )}
        </Card>

        <MonthlyProgressChartCard
          points={monthlyProgressQuery.data ?? []}
          isLoading={monthlyProgressQuery.isLoading}
          isError={monthlyProgressQuery.isError}
          errorMessage={monthlyProgressQuery.error?.message}
        />
      </div>

      {plan.Items.length > 0 && (
        <Card padding="md">
          <Text as="h2" variant="subtitle" weight="bold" className="text-text-primary">
            Top Recommendations
          </Text>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {plan.Items.map((item) => (
              <div key={`${item.Category}-${item.RecommendedAmount}`} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <PiggyBank size={16} aria-hidden="true" />
                  </span>
                  <Text variant="body" className="truncate text-text-primary">
                    {item.Category}
                  </Text>
                </div>
                <Text variant="body" className="shrink-0 text-emerald-600">
                  {formatRecommendationAmount(item.RecommendedAmount)}
                </Text>
              </div>
            ))}
          </div>
        </Card>
      )}

      {hasExtraSaving && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-semibold text-emerald-700">
          <CheckCircle2 size={22} className="shrink-0" aria-hidden="true" />
          <span>
            Extra saving opportunity: {formatSavingPlanCurrency(plan.ExtraSavingOpportunity)}
          </span>
        </div>
      )}
    </div>
  );
}

export default ActiveSavingPlanView;
