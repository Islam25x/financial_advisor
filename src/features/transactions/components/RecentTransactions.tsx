import { useMemo, useState } from "react";
import { useTransactions } from "../hooks/useTransactions";
import {
  mapTransactionsForTable,
  selectRecentTransactions,
} from "../utils/transaction.selectors";
import type { Transaction } from "../types/transaction.types";
import { Button, PanelCard, PanelHeader, Text } from "../../../shared/ui";
import TransactionsList from "./TransactionsList";
import AddTransactionModal from "./AddTransactionModal";

function RecentTransactions() {
  const { data, isLoading, isError, error } = useTransactions();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const transactions = useMemo(() => data?.items ?? [], [data]);
  const visibleTransactions = useMemo(
    () => selectRecentTransactions(transactions, 3),
    [transactions]
  );
  const rows = useMemo(
    () => mapTransactionsForTable(visibleTransactions),
    [visibleTransactions],
  );

  const handleOpenDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setSelectedTransaction(null);
    setIsEditOpen(false);
  };

  return (
    <>
      <PanelCard className="!w-full">
        <PanelHeader
          title="Recent transactions"
          right={
            <div className="flex gap-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsCreateOpen(true)}
                className="rounded-full px-4 py-1 text-sm"
              >
                + Add Transaction
              </Button>
            </div>
          }
        />

        {isLoading && (
          <div className="space-y-3 py-6">
            {[0, 1, 2].map((row) => (
              <div
                key={row}
                className="h-9 w-full animate-pulse rounded-lg bg-slate-100"
              />
            ))}
          </div>
        )}

        {isError && (
          <Text variant="body" className="py-8 text-rose-600">
            {error?.message ?? "Failed to load transactions."}
          </Text>
        )}

        {!isLoading && !isError && transactions.length === 0 && (
          <Text variant="body" className="py-8 text-slate-500">
            No transactions yet.
          </Text>
        )}

        {!isLoading && !isError && visibleTransactions.length > 0 && (
          <TransactionsList rows={rows} onOpenDetails={handleOpenDetails} />
        )}
      </PanelCard>

      <AddTransactionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        mode="create"
      />
      <AddTransactionModal
        isOpen={isEditOpen}
        onClose={handleCloseEdit}
        mode="edit"
        initialData={selectedTransaction ?? undefined}
      />
    </>
  );
}

export default RecentTransactions;
