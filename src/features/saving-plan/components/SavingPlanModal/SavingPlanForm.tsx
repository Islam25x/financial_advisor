import type { FormEvent } from "react";
import {
  CalendarDays,
  Leaf,
  Rocket,
  Sparkles,
  Star,
  Wallet,
  WandSparkles,
} from "lucide-react";
import { Button, Text, cn } from "../../../../shared/ui";
import type {
  SavingPlanDuration,
  SavingPlanFormErrors,
  SavingPlanFormState,
  SavingPlanType,
} from "../../types/saving-plan.types";

const durationOptions: Array<{
  months: SavingPlanDuration;
  title: string;
  subtitle: string;
}> = [
  { months: 3, title: "3 Months", subtitle: "Quarterly" },
  { months: 6, title: "6 Months", subtitle: "Semi-Annual" },
  { months: 12, title: "12 Months", subtitle: "Annual" },
];

const planTypeOptions: Array<{
  value: SavingPlanType;
  title: string;
  description: string;
  helper: string;
  icon: typeof Leaf;
  tone: string;
  badge?: string;
}> = [
  {
    value: "Easy",
    title: "Easy",
    description: "Lower monthly",
    helper: "commitment",
    icon: Leaf,
    tone: "bg-emerald-100 text-emerald-600",
  },
  {
    value: "Balanced",
    title: "Balanced",
    description: "Best balance of",
    helper: "saving & comfort",
    icon: Star,
    tone: "bg-primary/10 text-primary",
    badge: "Most Recommended",
  },
  {
    value: "Aggressive",
    title: "Aggressive",
    description: "Finish faster",
    helper: "Higher commitment",
    icon: Rocket,
    tone: "bg-orange-100 text-orange-600",
  },
];

type SavingPlanFormProps = {
  formState: SavingPlanFormState;
  errors: SavingPlanFormErrors;
  isSubmitting: boolean;
  notice?: string | null;
  onChange: (nextState: SavingPlanFormState) => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function RadioDot({ selected }: { selected: boolean }) {
  return (
    <span
      className={cn(
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
        selected ? "border-primary" : "border-slate-300",
      )}
      aria-hidden="true"
    >
      {selected && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
    </span>
  );
}

function SavingPlanForm({
  formState,
  errors,
  isSubmitting,
  notice,
  onChange,
  onCancel,
  onSubmit,
}: SavingPlanFormProps) {
  const updateState = (nextState: Partial<SavingPlanFormState>) => {
    onChange({
      ...formState,
      ...nextState,
    });
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="max-h-[62vh] overflow-y-auto px-5 py-4 sm:px-7">
        <div className="space-y-6">
          {notice && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-700">
              {notice}
            </div>
          )}

          <section className="space-y-4" aria-labelledby="saving-plan-duration">
            <div>
              <Text id="saving-plan-duration" as="h3" variant="body" weight="bold">
                1. Choose Duration
              </Text>
              <Text variant="body" className="text-text-secondary">
                How long do you want to achieve your goal?
              </Text>
              {errors.months && <p className="mt-2 text-xs text-rose-600">{errors.months}</p>}
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              {durationOptions.map((option) => {
                const selected = formState.months === option.months;

                return (
                  <button
                    key={option.months}
                    type="button"
                    disabled={isSubmitting}
                    aria-pressed={selected}
                    onClick={() => updateState({ months: option.months })}
                    className={cn(
                      "flex min-h-[72px] items-center gap-3 rounded-xl border p-3 text-left transition",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      selected ? "border-primary bg-primary/5" : "border-border bg-surface hover:border-primary/60",
                      isSubmitting && "cursor-not-allowed opacity-70",
                    )}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <CalendarDays size={20} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <Text as="span" variant="body" weight="bold" className="block text-text-primary">
                        {option.title}
                      </Text>
                      <Text as="span" variant="body" className="mt-1 block text-text-secondary">
                        {option.subtitle}
                      </Text>
                    </span>
                    <RadioDot selected={selected} />
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-4 border-t border-border pt-5" aria-labelledby="saving-plan-type">
            <div>
              <Text id="saving-plan-type" as="h3" variant="body" weight="bold">
                2. Choose Plan Type
              </Text>
              <Text variant="body" className="text-text-secondary">
                Choose the plan style that matches your commitment level.
              </Text>
              {errors.planType && <p className="mt-2 text-xs text-rose-600">{errors.planType}</p>}
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              {planTypeOptions.map((option) => {
                const selected = formState.planType === option.value;
                const Icon = option.icon;

                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={isSubmitting}
                    aria-pressed={selected}
                    onClick={() => updateState({ planType: option.value })}
                    className={cn(
                      "flex min-h-[112px] items-start gap-3 rounded-xl border p-3 text-left transition",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      selected ? "border-primary bg-primary/5" : "border-border bg-surface hover:border-primary/60",
                      isSubmitting && "cursor-not-allowed opacity-70",
                    )}
                  >
                    <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", option.tone)}>
                      <Icon size={22} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <Text as="span" variant="body" weight="bold" className="text-text-primary">
                          {option.title}
                        </Text>
                        {option.badge && (
                          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {option.badge}
                          </span>
                        )}
                      </span>
                      <Text as="span" variant="body" className="mt-2 block text-text-secondary">
                        {option.description}
                      </Text>
                      <Text as="span" variant="body" className="block text-text-secondary">
                        {option.helper}
                      </Text>
                    </span>
                    <RadioDot selected={selected} />
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-4" aria-labelledby="saving-plan-target">
            <div>
              <Text id="saving-plan-target" as="h3" variant="body" weight="bold">
                3. Target Monthly Saving
              </Text>
              <Text variant="body" className="text-text-secondary">
                Enter your target monthly saving or leave empty and let AI suggest the best amount.
              </Text>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
              <div>
                <div
                  className={cn(
                    "flex h-12 overflow-hidden rounded-xl border bg-surface",
                    errors.targetMonthlySaving ? "border-rose-500" : "border-gray-300",
                  )}
                >
                  <span className="flex w-12 shrink-0 items-center justify-center border-r border-border text-text-secondary">
                    <Wallet size={18} aria-hidden="true" />
                  </span>
                  <input
                    id="targetMonthlySaving"
                    name="targetMonthlySaving"
                    type="text"
                    inputMode="decimal"
                    disabled={isSubmitting}
                    placeholder="e.g. 3,000"
                    value={formState.targetMonthlySaving}
                    onChange={(event) => updateState({ targetMonthlySaving: event.target.value })}
                    className="min-w-0 flex-1 px-3 text-sm text-text-secondary outline-none placeholder:text-text-muted disabled:cursor-not-allowed"
                  />
                </div>
                <p className={cn("mt-2 text-xs", errors.targetMonthlySaving ? "text-rose-600" : "text-text-muted")}>
                  {errors.targetMonthlySaving ?? "Leave empty to let AI calculate the best target."}
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-primary/10 px-4 py-3 text-sm text-text-secondary">
                <Sparkles size={19} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                <span>Leave empty to let AI calculate the best target for you.</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-border px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
        <Button
          type="button"
          variant="secondary"
          size="md"
          disabled={isSubmitting}
          onClick={onCancel}
          className="min-w-32"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isSubmitting}
          disabled={isSubmitting}
          className="min-w-40"
        >
          {!isSubmitting && <WandSparkles size={17} aria-hidden="true" />}
          {isSubmitting ? "Generating..." : "Generate Plan"}
        </Button>
      </div>
    </form>
  );
}

export default SavingPlanForm;
