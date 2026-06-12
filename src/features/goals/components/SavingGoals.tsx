import { useMemo } from "react";
import { PanelCard, PanelHeader, Text } from "../../../shared/ui";
import { useGoals } from "../hooks/useGoals";
import GoalCard from "./GoalCard";

const SavingGoals = () => {
  const { data } = useGoals(1);
  const goals = useMemo(() => data?.items ?? [], [data]);

  return (
    <PanelCard className="h-full !w-full">
      <PanelHeader title="Saving Goals" />

      <div className="space-y-4">
        {goals.length === 0 && (
          <Text variant="body" className="text-gray-500">
            No goals yet
          </Text>
        )}
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} variant="dashboard" />
        ))}
      </div>
    </PanelCard>
  );
};

export default SavingGoals;
