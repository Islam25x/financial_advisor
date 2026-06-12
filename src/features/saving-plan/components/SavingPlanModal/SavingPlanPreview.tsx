import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  Gauge,
  Landmark,
  LineChart,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Button, Card, Text, cn } from "../../../../shared/ui";
import type {
  SavingPlanItemDto,
  SavingPlanResponseDto,
} from "../../api/saving-plan.dto";
import {
  formatSavingPlanCurrency,
  formatSavingPlanCurrencyDifference,
  formatSavingPlanDuration,
  formatSavingPlanPercentage,
} from "../../utils/saving-plan.formatters";

type SavingPlanPreviewProps = {
  plan: SavingPlanResponseDto;
  notice?: string | null;
  isApplying: boolean;
  onCancel: () => void;
  onGenerateAgain: () => void;
  onApply: () => void;
};

type ReportMetricCardProps = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone: string;
};

type OverviewItemProps = {
  label: string;
  value: string;
  icon: LucideIcon;
};

function ReportMetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone,
}: ReportMetricCardProps) {
  return (
    <Card padding="sm" className="min-h-[146px]">
      <div className="flex h-full flex-col">
        <div className="flex items-start gap-3">
          <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full", tone)}>
            <Icon size={21} aria-hidden="true" />
          </span>
          <Text variant="body" className="min-w-0 text-text-secondary">
            {label}
          </Text>
        </div>
        <Text as="p" className="mt-5 text-2xl font-bold tracking-tight text-text-primary">
          {value}
        </Text>
        <Text variant="caption" className="mt-auto pt-4 text-text-secondary">
          {helper}
        </Text>
      </div>
    </Card>
  );
}

function OverviewItem({ label, value, icon: Icon }: OverviewItemProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon size={18} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <Text variant="caption" className="text-text-secondary">
          {label}
        </Text>
        <Text variant="body" weight="bold" className="truncate text-text-primary">
          {value}
        </Text>
      </div>
    </div>
  );
}

function ForecastItem({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-4 lg:border-r lg:border-border lg:last:border-r-0">
      <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full", tone)}>
        <Icon size={21} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <Text variant="body" className="text-text-secondary">
          {label}
        </Text>
        <Text as="p" className="mt-2 text-2xl font-bold tracking-tight text-text-primary">
          {value}
        </Text>
        <Text variant="caption" className="mt-1 text-text-secondary">
          Total
        </Text>
      </div>
    </div>
  );
}

function SavingOpportunityDesktopRow({
  item,
  isExpanded,
  onToggle,
}: {
  item: SavingPlanItemDto;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr className="border-b border-border last:border-b-0">
        <td className="px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <PiggyBank size={17} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <Text variant="caption" weight="bold" className="truncate text-text-primary">
                {item.Category}
              </Text>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-text-secondary">{item.CategoryType ?? "-"}</td>
        <td className="px-4 py-3 text-sm font-semibold text-text-primary">
          {formatSavingPlanCurrency(item.CurrentAverage)}
        </td>
        <td className="px-4 py-3 text-sm font-semibold text-text-primary">
          {formatSavingPlanCurrency(item.RecommendedBudget)}
        </td>
        <td className="px-4 py-3 text-sm font-semibold text-orange-600">
          {formatSavingPlanPercentage(item.ReductionPercentage)}
        </td>
        <td className="px-4 py-3 text-sm font-semibold text-emerald-600">
          {formatSavingPlanCurrency(item.ExpectedSaving)}
        </td>
        <td className="px-3 py-3 text-right">
          {item.Reason && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              shape="circle"
              className="h-8 w-8"
              onClick={onToggle}
              aria-label={`${isExpanded ? "Collapse" : "Expand"} ${item.Category} reason`}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          )}
        </td>
      </tr>
      {isExpanded && item.Reason && (
        <tr>
          <td colSpan={7} className="px-4 pb-3">
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-sky-900">
              <span className="font-semibold">Reason: </span>
              {item.Reason}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function SavingOpportunityMobileCard({
  item,
  isExpanded,
  onToggle,
}: {
  item: SavingPlanItemDto;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <PiggyBank size={17} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <Text variant="body" weight="bold" className="truncate text-text-primary">
              {item.Category}
            </Text>
            <Text variant="caption" className="mt-0.5 text-text-secondary">
              {item.CategoryType ?? "-"}
            </Text>
          </div>
        </div>
        {item.Reason && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            shape="circle"
            className="h-8 w-8 shrink-0"
            onClick={onToggle}
            aria-label={`${isExpanded ? "Collapse" : "Expand"} ${item.Category} reason`}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <Text variant="caption" className="text-text-secondary">
            Current Avg.
          </Text>
          <Text variant="body" weight="bold" className="text-text-primary">
            {formatSavingPlanCurrency(item.CurrentAverage)}
          </Text>
        </div>
        <div>
          <Text variant="caption" className="text-text-secondary">
            Recommended
          </Text>
          <Text variant="body" weight="bold" className="text-text-primary">
            {formatSavingPlanCurrency(item.RecommendedBudget)}
          </Text>
        </div>
        <div>
          <Text variant="caption" className="text-text-secondary">
            Reduction
          </Text>
          <Text variant="body" weight="bold" className="text-orange-600">
            {formatSavingPlanPercentage(item.ReductionPercentage)}
          </Text>
        </div>
        <div>
          <Text variant="caption" className="text-text-secondary">
            Expected Saving
          </Text>
          <Text variant="body" weight="bold" className="text-emerald-600">
            {formatSavingPlanCurrency(item.ExpectedSaving)}
          </Text>
        </div>
      </div>

      {isExpanded && item.Reason && (
        <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-sky-900">
          <span className="font-semibold">Reason: </span>
          {item.Reason}
        </div>
      )}
    </div>
  );
}

function SavingPlanPreview({
  plan,
  notice,
  isApplying,
  onCancel,
  onGenerateAgain,
  onApply,
}: SavingPlanPreviewProps) {
  const [expandedItemKeys, setExpandedItemKeys] = useState<Set<string>>(() => new Set());

  const toggleItem = (itemKey: string) => {
    setExpandedItemKeys((currentKeys) => {
      const nextKeys = new Set(currentKeys);

      if (nextKeys.has(itemKey)) {
        nextKeys.delete(itemKey);
      } else {
        nextKeys.add(itemKey);
      }

      return nextKeys;
    });
  };

  return (
    <div>
      <div className="max-h-[62vh] overflow-y-auto px-5 py-4 sm:px-7">
        <div className="space-y-4">
          {notice && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-700">
              {notice}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <ReportMetricCard
              label="Recommended Monthly Saving"
              value={formatSavingPlanCurrency(plan.RecommendedMonthlySaving)}
              helper="To achieve your goal"
              icon={Wallet}
              tone="bg-primary/10 text-primary"
            />
            <ReportMetricCard
              label="Current Monthly Saving"
              value={formatSavingPlanCurrency(plan.CurrentAverageSaving)}
              helper="This month"
              icon={TrendingUp}
              tone="bg-emerald-100 text-emerald-600"
            />
            <ReportMetricCard
              label="Average Income"
              value={formatSavingPlanCurrency(plan.AverageIncome)}
              helper="Per month"
              icon={Landmark}
              tone="bg-violet-100 text-violet-600"
            />
            <ReportMetricCard
              label="Average Expenses"
              value={formatSavingPlanCurrency(plan.AverageExpenses)}
              helper="Per month"
              icon={TrendingDown}
              tone="bg-rose-100 text-rose-600"
            />
            <ReportMetricCard
              label="Forecasted Saving"
              value={formatSavingPlanCurrency(plan.ForecastedSaving)}
              helper="Next month"
              icon={BarChart3}
              tone="bg-blue-100 text-blue-600"
            />
            <ReportMetricCard
              label="Potential Extra Savings"
              value={formatSavingPlanCurrencyDifference(plan.ExtraSavingOpportunity)}
              helper="You can save more"
              icon={Sparkles}
              tone="bg-orange-100 text-orange-600"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <Card padding="md">
              <Text as="h3" variant="subtitle" weight="bold" className="text-text-primary">
                AI Plan Overview
              </Text>
              {plan.SummaryMessage && (
                <Text variant="body" className="mt-3 text-text-secondary">
                  {plan.SummaryMessage}
                </Text>
              )}
              <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                <OverviewItem
                  label="Duration"
                  value={formatSavingPlanDuration(plan.AnalysisPeriodMonths)}
                  icon={CalendarDays}
                />
                <OverviewItem
                  label="Plan Type"
                  value={plan.PlanType}
                  icon={Gauge}
                />
                <OverviewItem
                  label="Difficulty"
                  value={plan.PlanDifficulty ?? "-"}
                  icon={BarChart3}
                />
                <OverviewItem
                  label="Status"
                  value={plan.Status ?? "-"}
                  icon={LineChart}
                />
                <OverviewItem
                  label="Plan Status"
                  value={plan.PlanStatusLabel ?? "-"}
                  icon={ShieldCheck}
                />
                <OverviewItem
                  label="Monthly Target"
                  value={`${formatSavingPlanCurrency(plan.RecommendedMonthlySaving)} / month`}
                  icon={Target}
                />
              </div>
            </Card>

            <Card padding="md">
              <Text as="h3" variant="subtitle" weight="bold" className="text-text-primary">
                Financial Forecast
              </Text>
              <div className="mt-7 grid gap-6 lg:grid-cols-3">
                <ForecastItem
                  label="Forecasted Income"
                  value={formatSavingPlanCurrency(plan.ForecastedIncome)}
                  icon={Landmark}
                  tone="bg-emerald-100 text-emerald-600"
                />
                <ForecastItem
                  label="Forecasted Expenses"
                  value={formatSavingPlanCurrency(plan.ForecastedExpenses)}
                  icon={Wallet}
                  tone="bg-rose-100 text-rose-600"
                />
                <ForecastItem
                  label="Forecasted Saving"
                  value={formatSavingPlanCurrency(plan.ForecastedSaving)}
                  icon={LineChart}
                  tone="bg-blue-100 text-blue-600"
                />
              </div>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.55fr]">
            <div className={cn("grid gap-4", plan.Warnings.length > 0 && "lg:grid-cols-2 xl:grid-cols-1")}>
              <Card padding="md" className="border-emerald-100 bg-emerald-50/35">
                <Text as="h3" variant="subtitle" weight="bold" className="text-text-primary">
                  AI Insights
                </Text>
                <ul className="mt-5 space-y-4">
                  {plan.Insights.map((insight) => (
                    <li key={insight} className="flex gap-3 text-sm leading-6 text-text-secondary">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <Check size={15} strokeWidth={2.4} aria-hidden="true" />
                      </span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {plan.Warnings.length > 0 && (
                <Card padding="md" className="border-amber-200 bg-amber-50/45">
                  <Text as="h3" variant="subtitle" weight="bold" className="text-text-primary">
                    Warnings
                  </Text>
                  <ul className="mt-5 space-y-4">
                    {plan.Warnings.map((warning) => (
                      <li key={warning} className="flex gap-3 text-sm leading-6 text-text-secondary">
                        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-orange-500" aria-hidden="true" />
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>

            <Card padding="md">
              <Text as="h3" variant="body" weight="bold" className="text-text-primary">
                Saving Opportunities
              </Text>

              <div className="mt-4 hidden overflow-x-auto rounded-xl border border-border md:block">
                <table className="w-full min-w-[760px] border-collapse text-left">
                  <thead className="bg-slate-50 text-xs font-semibold text-text-secondary">
                    <tr>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Category Type</th>
                      <th className="px-4 py-3">Current Avg.</th>
                      <th className="px-4 py-3">Recommended Budget</th>
                      <th className="px-4 py-3">Reduction %</th>
                      <th className="px-4 py-3">Expected Saving</th>
                      <th className="px-3 py-3" aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {plan.Items.map((item, index) => {
                      const itemKey = `${item.Category}-${item.CategoryType ?? ""}-${index}`;
                      return (
                        <SavingOpportunityDesktopRow
                          key={itemKey}
                          item={item}
                          isExpanded={expandedItemKeys.has(itemKey)}
                          onToggle={() => toggleItem(itemKey)}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 space-y-3 md:hidden">
                {plan.Items.map((item, index) => {
                  const itemKey = `${item.Category}-${item.CategoryType ?? ""}-${index}`;
                  return (
                    <SavingOpportunityMobileCard
                      key={itemKey}
                      item={item}
                      isExpanded={expandedItemKeys.has(itemKey)}
                      onToggle={() => toggleItem(itemKey)}
                    />
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-border bg-surface px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
        <Button
          type="button"
          variant="secondary"
          size="md"
          disabled={isApplying}
          onClick={onCancel}
          className="min-w-32"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="md"
          disabled={isApplying}
          onClick={onGenerateAgain}
          className="min-w-40"
        >
          Generate Again
        </Button>
        <Button
          type="button"
          variant="primary"
          size="md"
          loading={isApplying}
          disabled={isApplying}
          onClick={onApply}
          className="min-w-40"
        >
          {isApplying ? "Applying..." : "Apply Plan"}
        </Button>
      </div>
    </div>
  );
}

export default SavingPlanPreview;
