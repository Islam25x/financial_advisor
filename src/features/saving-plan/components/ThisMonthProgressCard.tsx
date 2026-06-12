import type { LucideIcon } from "lucide-react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  BadgeCheck,
  PiggyBank,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Card, Text, cn } from "../../../shared/ui";
import type { SavingPlanCurrentProgress, SavingPlanProgressStatusVariant } from "../types/saving-plan.types";
import {
  formatSavingPlanCurrency,
  formatSavingPlanCurrencyDifference,
  formatSavingPlanPercentage,
} from "../utils/saving-plan.formatters";

type ThisMonthProgressCardProps = {
  progress?: SavingPlanCurrentProgress | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
};

const STATUS_BADGE_STYLES: Record<SavingPlanProgressStatusVariant, string> = {
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-orange-100 text-orange-700",
  danger: "bg-rose-100 text-rose-700",
  info: "bg-primary/10 text-primary",
};

const STATUS_RING_STYLES: Record<SavingPlanProgressStatusVariant, string> = {
  success: "text-emerald-600",
  warning: "text-orange-600",
  danger: "text-rose-600",
  info: "text-primary",
};

function ProgressRing({
  percentage,
  variant,
}: {
  percentage: number;
  variant: SavingPlanProgressStatusVariant;
}) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const dashOffset = circumference - (clampedPercentage / 100) * circumference;

  return (
    <div className={cn("relative h-36 w-36 shrink-0", STATUS_RING_STYLES[variant])}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="12"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Text as="span" variant="subtitle" weight="bold" className="text-text-primary">
          {formatSavingPlanPercentage(percentage)}
        </Text>
        <Text as="span" variant="caption" className="text-text-muted">
          Progress
        </Text>
      </div>
    </div>
  );
}

function ProgressMetricRow({
  icon: Icon,
  label,
  value,
  badgeClassName,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  badgeClassName?: string;
}) {
  return (
    <div className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 text-sm">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon size={15} aria-hidden="true" />
      </span>
      <Text as="span" variant="caption" className="text-text-secondary">
        {label}
      </Text>
      {badgeClassName ? (
        <span className={cn("rounded-md px-2 py-1 text-xs font-semibold", badgeClassName)}>
          {value}
        </span>
      ) : (
        <Text as="span" variant="body" weight="bold" className="text-text-primary">
          {value}
        </Text>
      )}
    </div>
  );
}

function ThisMonthProgressCard({
  progress,
  isLoading,
  isError,
  errorMessage,
}: ThisMonthProgressCardProps) {
  return (
    <Card padding="md" className="min-h-[360px] space-y-5">
      <Text as="h2" variant="subtitle" weight="bold" className="text-text-primary">
        This Month Progress
      </Text>

      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((row) => (
            <div key={row} className="h-9 w-full animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <Text variant="body" className="text-rose-600">
          {errorMessage ?? "Failed to load progress."}
        </Text>
      )}

      {!isLoading && !isError && !progress && (
        <div className="py-10 text-center text-sm text-text-muted">
          No progress data available yet.
        </div>
      )}

      {!isLoading && !isError && progress && (
        <>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_144px] lg:items-center">
            <div className="space-y-3">
              <ProgressMetricRow
                icon={Target}
                label="Recommended Monthly Saving"
                value={formatSavingPlanCurrency(progress.recommendedMonthlySaving)}
              />
              <ProgressMetricRow
                icon={Wallet}
                label="Actual Income"
                value={formatSavingPlanCurrency(progress.actualIncome)}
              />
              <ProgressMetricRow
                icon={ArrowDownCircle}
                label="Actual Expenses"
                value={formatSavingPlanCurrency(progress.actualExpenses)}
              />
              <ProgressMetricRow
                icon={PiggyBank}
                label="Actual Saving"
                value={formatSavingPlanCurrency(progress.actualSaving)}
              />
              <ProgressMetricRow
                icon={ArrowUpCircle}
                label="Difference"
                value={formatSavingPlanCurrencyDifference(progress.difference)}
              />
              <ProgressMetricRow
                icon={TrendingUp}
                label="Progress Percentage"
                value={formatSavingPlanPercentage(progress.progressPercentage)}
              />
              <ProgressMetricRow
                icon={BadgeCheck}
                label="Status"
                value={progress.status}
                badgeClassName={STATUS_BADGE_STYLES[progress.statusVariant]}
              />
            </div>
            <ProgressRing percentage={progress.progressPercentage} variant={progress.statusVariant} />
          </div>

          <div className="rounded-xl border border-primary/10 bg-primary/5 p-3">
            <Text variant="body" className="text-sm text-text-secondary">
              {progress.summary}
            </Text>
          </div>
        </>
      )}
    </Card>
  );
}

export default ThisMonthProgressCard;
