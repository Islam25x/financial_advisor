import { useState } from "react";
import { Bot, Check, Sparkles } from "lucide-react";
import { Button, Card, PageHeader, Text, cn } from "../../../shared/ui";
import { useActiveSavingPlan } from "../hooks/useActiveSavingPlan";
import { useDeactivateSavingPlan } from "../hooks/useDeactivateSavingPlan";
import ActiveSavingPlanView from "./ActiveSavingPlanView";
import DeactivateSavingPlanConfirmModal from "./DeactivateSavingPlanConfirmModal";
import SavingPlanModal from "./SavingPlanModal/SavingPlanModal";



const previewItems = [
  "Personalized monthly saving",
  "Financial forecast",
  "Monthly breakdown",
  "Smart insights",
];

function StepIndicator({ value }: { value: number }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
      {value}
    </span>
  );
}

type SelectCardProps = {
  title: string;
  subtitle?: string;
  selected: boolean;
  badge?: string;
};

function SelectCard({ title, subtitle, selected, badge }: SelectCardProps) {
  return (
    <div
      className={cn(
        "min-h-24 rounded-xl border p-4 transition",
        selected
          ? "border-primary bg-primary text-white shadow-md"
          : "border-border bg-surface text-text-primary",
      )}
    >

      <span className="flex items-start justify-between gap-3">
        <span>
          <Text as="span" variant="body" weight="bold" className="block">
            {title}
          </Text>
          {subtitle && (
            <Text
              as="span"
              variant="caption"
              className={cn("mt-1 block", selected ? "text-white/80" : "text-gray-500")}
            >
              {subtitle}
            </Text>
          )}
        </span>
        {badge && (
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-semibold",
              selected ? "bg-white/20 text-white" : "bg-primary/10 text-primary",
            )}
          >
            {badge}
          </span>
        )}
      </span>
    </div>
  );
}

function SavingPlanOnboarding() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Saving Plan"
        subtitle="Create a personalized saving plan powered by AI."
      />

      <Card padding="lg" className="space-y-6">
        <div className="flex items-start gap-3">
          <StepIndicator value={1} />
          <div>
            <Text as="h2" variant="subtitle" weight="bold">
              Create Your Plan
            </Text>
            <Text variant="body" className="text-gray-500">
              Choose duration and plan type. Our AI will create the best plan for you.
            </Text>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-3">
            <Text as="h3" variant="body" weight="bold">
              Choose Duration
            </Text>

            <div className="grid gap-3 sm:grid-cols-3">
              <SelectCard
                title="3 Months"
                subtitle="Quarterly"
                selected={false}
              />

              <SelectCard
                title="6 Months"
                subtitle="Semi-Annual"
                selected={true}
              />

              <SelectCard
                title="12 Months"
                subtitle="Annual"
                selected={false}
              />
            </div>
          </section>

          <section className="space-y-3">
            <Text as="h3" variant="body" weight="bold">
              Choose Plan Type
            </Text>

            <div className="grid gap-3 sm:grid-cols-3">
              <SelectCard
                title="Easy"
                selected={false}
              />

              <SelectCard
                title="Balanced"
                badge="Most Recommended"
                selected={true}
              />

              <SelectCard
                title="Aggressive"
                selected={false}
              />
            </div>
          </section>
        </div>

        <Button type="button" onClick={() => setIsCreateModalOpen(true)}>
          Create Plan with AI
        </Button>
      </Card>

      <Card padding="lg" className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <StepIndicator value={2} />
            <div>
              <Text as="h2" variant="subtitle" weight="bold">
                AI Plan Preview
              </Text>
              <Text variant="body" className="text-gray-500">
                See what your AI plan will include before applying it.
              </Text>
            </div>
          </div>
          <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Preview before apply
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Bot size={42} strokeWidth={1.8} aria-hidden="true" />
            </div>
            <div>
              <Text as="h3" variant="subtitle" weight="bold">
                Create your plan to see AI recommendations
              </Text>
              <Text variant="body" className="mt-2 max-w-2xl text-gray-500">
                Our AI will analyze your income, expenses, and financial habits to create a personalized saving plan.
              </Text>
            </div>
          </div>

          <ul className="space-y-3">
            {previewItems.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm font-medium text-text-secondary">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check size={15} strokeWidth={2.4} aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <Card padding="lg">
        <div className="flex items-start gap-3">
          <StepIndicator value={3} />
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Text as="h2" variant="subtitle" weight="bold">
                After Apply
              </Text>
              <Sparkles size={18} className="text-primary" aria-hidden="true" />
            </div>
            <Text variant="body" className="max-w-3xl text-gray-500">
              Once your plan is applied, you'll be able to track your progress, monitor monthly savings, and manage your active plan.
            </Text>
          </div>
        </div>
      </Card>

      <SavingPlanModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

function SavingPlanPage() {
  const activePlanQuery = useActiveSavingPlan();
  const deactivateSavingPlanMutation = useDeactivateSavingPlan();
  const [isDeactivateConfirmOpen, setIsDeactivateConfirmOpen] = useState(false);

  const activePlan = activePlanQuery.data ?? null;
  const deactivateError = deactivateSavingPlanMutation.error;

  const handleDeactivate = async () => {
    if (!activePlan) {
      return;
    }

    try {
      await deactivateSavingPlanMutation.mutateAsync(activePlan.Id);
      setIsDeactivateConfirmOpen(false);
    } catch {
      // React Query stores the error for the confirmation dialog.
    }
  };

  if (activePlanQuery.isLoading) {
    return (
      <div className="space-y-5">
        <PageHeader
          title="Saving Plan"
          subtitle="Create a personalized saving plan powered by AI."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-36 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (activePlanQuery.isError) {
    return (
      <div className="space-y-5">
        <PageHeader
          title="Saving Plan"
          subtitle="Create a personalized saving plan powered by AI."
        />
        <Card padding="md" className="border border-rose-200 bg-rose-50">
          <Text variant="body" className="text-rose-700">
            {activePlanQuery.error.message}
          </Text>
        </Card>
      </div>
    );
  }

  if (!activePlan) {
    return <SavingPlanOnboarding />;
  }

  return (
    <>
      <ActiveSavingPlanView
        plan={activePlan}
        onDeactivateClick={() => {
          deactivateSavingPlanMutation.reset();
          setIsDeactivateConfirmOpen(true);
        }}
      />
      <DeactivateSavingPlanConfirmModal
        isOpen={isDeactivateConfirmOpen}
        isSubmitting={deactivateSavingPlanMutation.isPending}
        errorMessage={deactivateError?.message ?? null}
        onClose={() => setIsDeactivateConfirmOpen(false)}
        onConfirm={handleDeactivate}
      />
    </>
  );
}

export default SavingPlanPage;
