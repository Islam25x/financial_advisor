import { PanelCard, PanelHeader, Text } from "../../../shared/ui";
import type { Goal } from "../types/goal.types";
import { Lightbulb, Target, TrendingUp } from "lucide-react";

type GoalsInsightsCardProps = {
  goals: Goal[];
};

function GoalsInsightsCard({ goals }: GoalsInsightsCardProps) {
  const activeGoal = goals[0];

  return (
    <PanelCard>
      <PanelHeader
        title="Insights"
        right={
          <Text as="span" variant="body" className="text-gray-400">
            ...
          </Text>
        }
      />

      <div className="space-y-4 text-sm text-gray-700">
        <div className="flex items-start gap-3">
          <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <TrendingUp size={16} />
          </span>
          <div>
            <Text variant="body" weight="bold" className="text-gray-900">
              Save {activeGoal?.monthlyAmount.toFixed(2) ?? "0.00"} each month
            </Text>
            <Text variant="body" className="text-gray-500">
              Consistency is the fastest way to hit your target.
            </Text>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Target size={16} />
          </span>
          <div>
            <Text variant="body" weight="bold" className="text-gray-900">
              Reach it in {activeGoal?.durationValue.toFixed(2) ?? "0.00"} months
            </Text>
            <Text variant="body" className="text-gray-500">
              Based on your current plan.
            </Text>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lightbulb size={16} />
          </span>
          <div>
            <Text variant="body" weight="bold" className="text-gray-900">
              Tip
            </Text>
            <Text variant="body" className="text-gray-500">
              Pick a monthly amount you can sustain without missing a month.
            </Text>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg bg-gray-100 p-4 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <Text as="span" variant="body">
            Goal: {activeGoal?.title ?? "N/A"}
          </Text>
          <Text as="span" variant="body">
            {activeGoal?.targetAmount.toLocaleString() ?? "0"}
          </Text>
        </div>
        <div className="mt-3 h-20 rounded-lg bg-gray-200" aria-hidden="true" />
        <Text variant="body" className="mt-3 text-gray-500">
          {activeGoal?.monthlyAmount.toLocaleString() ?? "0"} per month for{" "}
          {activeGoal?.durationValue.toFixed(2) ?? "0.00"} months
        </Text>
      </div>
    </PanelCard>
  );
}

export default GoalsInsightsCard;
