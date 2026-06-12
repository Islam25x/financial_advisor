import { useState } from "react";
import AdjustBalanceModal from "./AdjustBalanceModal";
import AddTransactionModal from "../../transactions/components/AddTransactionModal";
import { useUserProfile } from "../../../features/user/hooks/useUserProfile";
import { getUserDisplayName } from "../../../features/user/utils/user.selectors";
import { useDashboardSummary } from "../hooks/useDashboard";
import { FinancialSummaryCards, PageHeader } from "../../../shared/ui";
import { mapDashboardCardSummaryToFinancialSummary } from "../utils/dashboard-summary-metrics";

type ForcedTransactionType = "income" | "expense" | null;

function logDashboardDebug(message: string, payload?: unknown): void {
  if (!import.meta.env.DEV) {
    return;
  }

  console.debug(`[dashboard] ${message}`, payload);
}

const DashboardTop = () => {
  const { data: profile } = useUserProfile();
  const {
    data: summary,
    isLoading,
    isError,
    error,
    status,
  } = useDashboardSummary();
  const displayName = profile ? getUserDisplayName(profile) : "Finexa User";
  const [forcedTransactionType, setForcedTransactionType] =
    useState<ForcedTransactionType>(null);
  const [isAdjustBalanceOpen, setIsAdjustBalanceOpen] = useState(false);

  if (import.meta.env.DEV) {
    logDashboardDebug("DashboardTop render state", {
      status,
      isLoading,
      isError,
      summary,
      errorMessage: error?.message,
    });
  }

  return (
    <section id="DashboardTop" className="container mt-5 px-3 pb-8 space-y-5">
      <PageHeader
        title={`Welcome back, ${displayName}`}
        subtitle="Welcome to your dashboard"
      />
      <FinancialSummaryCards
        summary={mapDashboardCardSummaryToFinancialSummary(summary)}
        isLoading={isLoading}
        isError={isError}
        actions={{
          balance: () => setIsAdjustBalanceOpen(true),
          income: () => setForcedTransactionType("income"),
          expenses: () => setForcedTransactionType("expense"),
        }}
      />

      <AddTransactionModal
        isOpen={forcedTransactionType !== null}
        onClose={() => setForcedTransactionType(null)}
        mode="create"
        forcedType={forcedTransactionType ?? undefined}
      />
      <AdjustBalanceModal
        isOpen={isAdjustBalanceOpen}
        currentBalance={typeof summary?.totalBalance === "number" ? summary.totalBalance : 0}
        onClose={() => setIsAdjustBalanceOpen(false)}
      />
    </section>
  );
};

export default DashboardTop;
