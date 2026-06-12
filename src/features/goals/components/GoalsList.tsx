import { Text } from "../../../shared/ui";
import type { Goal } from "../types/goal.types";
import GoalCard from "./GoalCard";

type GoalsListProps = {
  goals: Goal[];
  onAddMoney?: (goal: Goal) => void;
  onOpenHistory?: (goal: Goal) => void;
  onCancelGoal?: (goal: Goal) => void;
};

function GoalsList({ goals, onAddMoney, onOpenHistory, onCancelGoal }: GoalsListProps) {
  if (goals.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface px-5 py-8 text-center">
        <Text variant="body" weight="bold" className="text-gray-900">
          No goals yet
        </Text>
        <Text variant="body" className="mt-2 text-gray-500">
          Start by creating your first goal
        </Text>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onAddMoney={onAddMoney}
          onOpenHistory={onOpenHistory}
          onCancelGoal={onCancelGoal}
        />
      ))}
    </div>
  );
}

export default GoalsList;
