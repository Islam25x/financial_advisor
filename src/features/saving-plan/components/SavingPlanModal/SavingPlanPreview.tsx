import {
  AlertTriangle,
  CalendarDays,
  Check,
  PiggyBank,
  Star,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Button, Card, Text, cn } from "../../../../shared/ui";
import type { SavingPlanResponseDto } from "../../api/saving-plan.dto";

type SavingPlanPreviewProps = {
  plan: SavingPlanResponseDto;
  notice?: string | null;
  isApplying: boolean;
  onCancel: () => void;
  onGenerateAgain: () => void;
  onApply: () => void;
};

function formatCurrency(value?: number): string {
  if (value === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatOpportunity(value?: number): string {
  if (value === undefined) {
    return "-";
  }

  return `+${formatCurrency(value)}`;
}

function formatDateRange(startDate?: string | null, endDate?: string | null): string | null {
  if (!startDate && !endDate) {
    return null;
  }

  if (startDate && endDate) {
    return `${startDate} - ${endDate}`;
  }

  return startDate ?? endDate ?? null;
}

type SummaryCardProps = {
  label: string;
  value: string;
  suffix?: string;
  helper?: string;
  icon: typeof Wallet;
  tone: string;
};

function SummaryCard({ label, value, suffix, helper, icon: Icon, tone }: SummaryCardProps) {
  return (
    <Card padding="sm" className="min-h-[128px]">
      <div className="flex items-start gap-3">
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", tone)}>
          <Icon size={21} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <Text variant="body" className="text-text-secondary">
            {label}
          </Text>
          <div className="mt-4 flex items-end gap-1.5">
            <span className="text-2xl font-bold text-text-primary">{value}</span>
            {suffix && <span className="pb-1 text-xs font-bold text-text-primary">{suffix}</span>}
          </div>
          {helper && (
            <Text variant="caption" className="mt-3 text-text-secondary">
              {helper}
            </Text>
          )}
        </div>
      </div>
    </Card>
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
  const dateRange = formatDateRange(plan.StartDate, plan.EndDate);

  return (
    <div>
      <div className="max-h-[62vh] overflow-y-auto px-5 py-4 sm:px-7">
        <div className="space-y-4">
          {notice && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-700">
              {notice}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              label="Recommended Monthly Saving"
              value={formatCurrency(plan.RecommendedMonthlySaving)}
              helper="To achieve your goal"
              icon={Wallet}
              tone="bg-primary/10 text-primary"
            />
            <SummaryCard
              label="Current Average Saving"
              value={formatCurrency(plan.CurrentAverageSaving)}
              helper="This month"
              icon={TrendingUp}
              tone="bg-emerald-100 text-emerald-600"
            />
            <SummaryCard
              label="Extra Saving Opportunity"
              value={formatOpportunity(plan.ExtraSavingOpportunity)}
              helper="You can save more"
              icon={Star}
              tone="bg-orange-100 text-orange-600"
            />
            <SummaryCard
              label="Plan Difficulty"
              value={plan.PlanDifficulty ?? "-"}
              icon={CalendarDays}
              tone="bg-sky-100 text-primary"
            />
          </div>

          <Card padding="md" className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <section className="lg:border-r lg:border-border lg:pr-5">
                <Text as="h3" variant="body" weight="bold">
                  Plan Summary
                </Text>
                {plan.SummaryMessage && (
                  <div className="mt-4 flex gap-3">
                    <span className="text-3xl font-bold leading-none text-primary">"</span>
                    <Text variant="body" className="max-w-sm text-text-secondary">
                      {plan.SummaryMessage}
                    </Text>
                  </div>
                )}

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <CalendarDays size={20} className="mt-1 shrink-0 text-text-secondary" />
                    <div>
                      <Text variant="caption" className="text-text-secondary">
                        Duration
                      </Text>
                      <Text variant="body" weight="bold" className="text-text-primary">
                        {plan.Duration ?? "-"}
                      </Text>
                      {dateRange && (
                        <Text variant="caption" className="mt-1 text-text-secondary">
                          {dateRange}
                        </Text>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Target size={20} className="mt-1 shrink-0 text-text-secondary" />
                    <div>
                      <Text variant="caption" className="text-text-secondary">
                        Monthly Target
                      </Text>
                      <Text variant="body" weight="bold" className="text-text-primary">
                        {formatCurrency(plan.TargetMonthlySaving)}
                      </Text>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <Text as="h3" variant="body" weight="bold">
                  What You'll Get
                </Text>
                <ul className="mt-4 space-y-3">
                  {plan.Insights.map((insight) => (
                    <li key={insight} className="flex items-center gap-3 text-sm text-text-secondary">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <Check size={15} strokeWidth={2.4} aria-hidden="true" />
                      </span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {plan.Items.length > 0 && (
              <section className="border-t border-border pt-4">
                <Text as="h3" variant="body" weight="bold">
                  Top Recommendations
                </Text>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {plan.Items.map((item) => (
                    <div
                      key={`${item.Category}-${item.RecommendedAmount}`}
                      className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <PiggyBank size={20} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <Text variant="caption" weight="bold" className="truncate text-text-primary">
                          {item.Category}
                        </Text>
                        <Text variant="caption" className="mt-1 text-emerald-600">
                          Save {formatCurrency(item.RecommendedAmount)} / month
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {plan.Warnings.length > 0 && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                <div className="space-y-1">
                  {plan.Warnings.map((warning) => (
                    <p key={warning}>{warning}</p>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-border px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
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
