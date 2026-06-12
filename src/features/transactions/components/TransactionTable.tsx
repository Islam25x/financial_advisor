import type { TransactionRowData } from "../utils/transaction.selectors";
import TransactionSectionHeader from "./TransactionSectionHeader";
import EmptyState from "./EmptyState";
import { PanelCard } from "../../../shared/ui";
import { Text } from "../../../shared/ui";
import TransactionsList from "./TransactionsList";
import type { Transaction } from "../types/transaction.types";

type TransactionTableProps = {
  rows: TransactionRowData[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  count: number;
  onAddTransaction?: () => void;
  onOpenDetails: (transaction: Transaction) => void;
};

function TransactionTable({
  rows,
  isLoading,
  isError,
  errorMessage,
  count,
  onAddTransaction,
  onOpenDetails,
}: TransactionTableProps) {
  return (
    <PanelCard>
      <TransactionSectionHeader count={count} onAddTransaction={onAddTransaction} />

      {isLoading && (
        <div className="space-y-3 py-6">
          {[0, 1, 2, 3, 4].map((row) => (
            <div
              key={row}
              className="h-10 w-full animate-pulse rounded-lg bg-slate-100"
            />
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <Text variant="body" className="py-8 text-rose-600">
          {errorMessage ?? "Failed to load transactions."}
        </Text>
      )}

      {!isLoading && !isError && rows.length === 0 && <EmptyState />}

      {!isLoading && !isError && rows.length > 0 && (
        <TransactionsList rows={rows} onOpenDetails={onOpenDetails} />
      )}
    </PanelCard>
  );
}

export default TransactionTable;
