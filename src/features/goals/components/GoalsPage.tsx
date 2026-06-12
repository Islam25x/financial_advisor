import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button, Input, PageHeader } from "../../../shared/ui";
import GoalsSummaryCards, { type GoalsSummary } from "./GoalsSummaryCards";
import GoalsListCard from "./GoalsListCard";
import GoalsInsightsCard from "./GoalsInsightsCard";
import { useGoals } from "../hooks/useGoals";
import CreateGoalModal from "./CreateGoalModal";
import type { Goal } from "../types/goal.types";
import GoalAddMoneyModal from "./GoalAddMoneyModal";
import GoalCancelConfirmModal from "./GoalCancelConfirmModal";
import GoalHistoryOverlay from "./GoalHistoryOverlay";
import { useContributeGoal } from "../hooks/useContributeGoal";
import { useRefundGoal } from "../hooks/useRefundGoal";
import { useCancelGoal } from "../hooks/useCancelGoal";
import { useGoalHistory } from "../hooks/useGoalHistory";

const PAGE_SIZE = 2;
const HISTORY_PAGE_SIZE = 2;

function GoalsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading } = useGoals(currentPage);
  const [query, setQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [addMoneyGoal, setAddMoneyGoal] = useState<Goal | null>(null);
  const [cancelGoalTarget, setCancelGoalTarget] = useState<Goal | null>(null);
  const [historyGoal, setHistoryGoal] = useState<Goal | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const contributeGoalMutation = useContributeGoal();
  const refundGoalMutation = useRefundGoal();
  const cancelGoalMutation = useCancelGoal();
  const goals = useMemo(() => data?.items ?? [], [data]);
  const totalGoalsCount = data?.totalCount ?? goals.length;
  const goalsPageSize = data?.pageSize ?? PAGE_SIZE;
  const currentGoalsPage = data?.pageNumber ?? currentPage;
  const historyQuery = useGoalHistory(
    historyGoal?.id ?? null,
    historyPage,
  );

  const filteredGoals = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return goals;
    }
    return goals.filter((goal) =>
      goal.title.toLowerCase().includes(normalized) ||
      goal.description.toLowerCase().includes(normalized)
    );
  }, [goals, query]);

  const totalPages = Math.max(1, Math.ceil(totalGoalsCount / goalsPageSize));
  const safePage = Math.min(currentGoalsPage, totalPages);
  const pagedGoals = filteredGoals;

  const summary: GoalsSummary = useMemo(() => {
    const totalGoals = goals.length;
    const totalTargetAmount = goals.reduce((acc, goal) => acc + goal.targetAmount, 0);
    const totalMonthlyAmount = goals.reduce((acc, goal) => acc + goal.monthlyAmount, 0);
    const averageDuration =
      totalGoals > 0
        ? goals.reduce((acc, goal) => acc + goal.durationValue, 0) / totalGoals
        : 0;
    const longestDuration = goals.reduce(
      (acc, goal) => Math.max(acc, goal.durationValue),
      0,
    );

    return {
      totalGoals,
      totalTargetAmount,
      totalMonthlyAmount,
      averageDuration,
      longestDuration,
    };
  }, [goals]);

  const handleOpenHistory = (goal: Goal) => {
    setHistoryGoal(goal);
    setHistoryPage(1);
  };

  const handleCloseHistory = () => {
    setHistoryGoal(null);
    setHistoryPage(1);
  };

  const handleContribute = async (amount: number) => {
    if (!addMoneyGoal) {
      return;
    }

    await contributeGoalMutation.mutateAsync({
      goalId: addMoneyGoal.id,
      amount,
    });
    setAddMoneyGoal(null);
    setToastMessage("Money added successfully.");
  };

  const handleCancelGoal = async () => {
    if (!cancelGoalTarget) {
      return;
    }

    await cancelGoalMutation.mutateAsync(cancelGoalTarget.id);
    await refundGoalMutation.mutateAsync(cancelGoalTarget.id);

    if (historyGoal?.id === cancelGoalTarget.id) {
      handleCloseHistory();
    }

    setCancelGoalTarget(null);
    setToastMessage("Goal cancelled successfully.");
  };

  return (
    <div className="space-y-5">
      {toastMessage && (
        <div className="fixed right-6 top-6 z-[1400] rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-lg">
          <div className="flex items-center gap-3">
            <span>{toastMessage}</span>
            <button
              type="button"
              className="text-emerald-500 transition hover:text-emerald-700"
              onClick={() => setToastMessage(null)}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <PageHeader title="Goals" subtitle="Stay consistent and hit your targets." />

      <div className="relative w-full md:max-w-sm">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search Goals..."
          className="pl-10"
        />
      </div>

      <GoalsSummaryCards summary={summary} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[0, 1].map((row) => (
                <div
                  key={row}
                  className="h-72 w-full animate-pulse rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          ) : (
            <GoalsListCard
              goals={pagedGoals}
              totalCount={totalGoalsCount}
              onAddGoal={() => setIsCreateOpen(true)}
              onAddMoney={setAddMoneyGoal}
              onOpenHistory={handleOpenHistory}
              onCancelGoal={setCancelGoalTarget}
            />
          )}

          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <Button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
                variant={page === safePage ? "primary" : "secondary"}
                size="sm"
                className={`h-9 w-9 rounded-lg text-sm font-medium ${
                  page === safePage
                    ? "border-primary"
                    : "border-gray-200 text-gray-600"
                }`}
              >
                {page}
              </Button>
            ))}
          </div>
        </div>
        <div className="relative">
          <GoalsInsightsCard goals={goals} />
          {historyGoal && (
            <GoalHistoryOverlay
              goal={historyGoal}
              history={historyQuery.data}
              isLoading={historyQuery.isLoading}
              pageNumber={historyPage}
              onClose={handleCloseHistory}
              onPreviousPage={() => setHistoryPage((current) => Math.max(1, current - 1))}
              onNextPage={() => {
                const totalCount = historyQuery.data?.totalCount ?? 0;
                const totalPages = Math.max(1, Math.ceil(totalCount / HISTORY_PAGE_SIZE));
                setHistoryPage((current) => Math.min(totalPages, current + 1));
              }}
            />
          )}
        </div>
      </div>

      <CreateGoalModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      <GoalAddMoneyModal
        goal={addMoneyGoal}
        isOpen={!!addMoneyGoal}
        isSubmitting={contributeGoalMutation.isPending}
        onClose={() => setAddMoneyGoal(null)}
        onSubmit={handleContribute}
      />
      <GoalCancelConfirmModal
        goal={cancelGoalTarget}
        isOpen={!!cancelGoalTarget}
        isSubmitting={refundGoalMutation.isPending || cancelGoalMutation.isPending}
        onClose={() => setCancelGoalTarget(null)}
        onConfirm={handleCancelGoal}
      />
    </div>
  );
}

export default GoalsPage;
