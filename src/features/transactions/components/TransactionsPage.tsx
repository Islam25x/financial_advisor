import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import AdjustBalanceModal from "../../dashboard/components/AdjustBalanceModal";
import { useDashboardSummary } from "../../dashboard/hooks/useDashboard";
import { mapDashboardCardSummaryToFinancialSummary } from "../../dashboard/utils/dashboard-summary-metrics";
import { useTransactions } from "../hooks/useTransactions";
import {
  mapTransactionsForTable,
  selectTransactionsInsights,
  type TransactionRowData,
} from "../utils/transaction.selectors";
import TransactionTable from "./TransactionTable";
import AIInsightsCard from "./AIInsightsCard";
import AddTransactionModal from "./AddTransactionModal";
import { Button, FinancialSummaryCards, Input, PageHeader } from "../../../shared/ui";
import type { TransactionsTypeUiFilter } from "../types/transactions-filter.types";
import type { Transaction } from "../types/transaction.types";

function TransactionsPage() {
  const [filterType, setFilterType] = useState<TransactionsTypeUiFilter>("all");
  const [pageNumber, setPageNumber] = useState(1);
  const { data, isLoading, isError, error } = useTransactions({
    typeFilter: filterType,
    pageNumber,
  });
  const {
    data: dashboardSummary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useDashboardSummary();
  const [searchValue, setSearchValue] = useState("");
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isAdjustBalanceOpen, setIsAdjustBalanceOpen] = useState(false);
  const [forcedTransactionType, setForcedTransactionType] = useState<"income" | "expense" | undefined>(undefined);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const transactions = useMemo(() => data?.items ?? [], [data]);
  const currentPage = data?.pageNumber ?? pageNumber;
  const pageSize = data?.pageSize ?? 4;
  const totalCount = data?.totalCount ?? transactions.length;
  const insights = useMemo(() => selectTransactionsInsights(transactions), [transactions]);
  const tableRows = useMemo(
    () => mapTransactionsForTable(transactions),
    [transactions]
  );

  const filteredRows = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return tableRows.filter((row) => {
      const matchesQuery =
        !query ||
        (row.merchant ?? "").toLowerCase().includes(query) ||
        row.displayTitle.toLowerCase().includes(query) ||
        (row.item ?? "").toLowerCase().includes(query) ||
        (row.rawCategory ?? "").toLowerCase().includes(query);

      return matchesQuery;
    });
  }, [tableRows, searchValue]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedRows: TransactionRowData[] = filteredRows;

  const handlePageChange = (page: number) => {
    setPageNumber(page);
  };

  const handleFilterChange = (value: TransactionsTypeUiFilter) => {
    setFilterType(value);
    setPageNumber(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setPageNumber(1);
  };

  const handleOpenDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setSelectedTransaction(null);
    setIsEditOpen(false);
  };

  const openCreateModal = (forcedType?: "income" | "expense") => {
    setForcedTransactionType(forcedType);
    setIsAddTransactionOpen(true);
  };

  const handleCloseCreate = () => {
    setIsAddTransactionOpen(false);
    setForcedTransactionType(undefined);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Transactions"
        subtitle="Track every payment and income stream."
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            type="text"
            value={searchValue}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search transactions..."
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(["all", "income", "expense"] as const).map((type) => (
            <Button
              key={type}
              type="button"
              onClick={() => handleFilterChange(type)}
              variant={filterType === type ? "primary" : "secondary"}
              size="sm"
              className={`rounded-full px-4 py-1 text-sm font-medium ${filterType === type ? "border-primary" : "border-gray-200 text-gray-600"
                }`}
            >
              {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <FinancialSummaryCards
        summary={mapDashboardCardSummaryToFinancialSummary(dashboardSummary)}
        isLoading={isSummaryLoading}
        isError={isSummaryError}
        actions={{
          balance: () => setIsAdjustBalanceOpen(true),
          income: () => openCreateModal("income"),
          expenses: () => openCreateModal("expense"),
        }}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="space-y-4">
          <TransactionTable
            rows={pagedRows}
            isLoading={isLoading}
            isError={isError}
            errorMessage={error?.message}
            count={totalCount}
            onAddTransaction={() => setIsAddTransactionOpen(true)}
            onOpenDetails={handleOpenDetails}
          />

          <div className="flex items-center justify-center gap-2">
            <Button
              type="button"
              onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
              variant="secondary"
              size="sm"
              disabled={safePage === 1}
              className="rounded-lg border border-gray-200 px-3 py-1 text-sm text-gray-600"
            >
              Prev
            </Button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <Button
                key={page}
                type="button"
                onClick={() => handlePageChange(page)}
                variant={page === safePage ? "primary" : "secondary"}
                size="sm"
                className={`h-9 w-9 rounded-lg border text-sm font-medium ${page === safePage
                  ? "border-primary"
                  : "border-gray-200 text-gray-600"
                  }`}
              >
                {page}
              </Button>
            ))}
            <Button
              type="button"
              onClick={() => setPageNumber((prev) => Math.min(prev + 1, totalPages))}
              variant="secondary"
              size="sm"
              disabled={safePage === totalPages}
              className="rounded-lg border border-gray-200 px-3 py-1 text-sm text-gray-600"
            >
              Next
            </Button>
          </div>

          <div className="flex items-center justify-center">
            <span className="text-sm text-gray-500">
              Page {safePage} of {totalPages}
            </span>
          </div>
        </div>

        <div className="lg:self-start">
          <AIInsightsCard insights={insights} isLoading={isLoading} />
        </div>
      </div>

      <AddTransactionModal
        isOpen={isAddTransactionOpen}
        onClose={handleCloseCreate}
        mode="create"
        forcedType={forcedTransactionType}
      />
      <AdjustBalanceModal
        isOpen={isAdjustBalanceOpen}
        currentBalance={
          typeof dashboardSummary?.totalBalance === "number"
            ? dashboardSummary.totalBalance
            : 0
        }
        onClose={() => setIsAdjustBalanceOpen(false)}
      />
      <AddTransactionModal
        isOpen={isEditOpen}
        onClose={handleCloseEdit}
        mode="edit"
        initialData={selectedTransaction ?? undefined}
      />
    </div>
  );
}

export default TransactionsPage;
