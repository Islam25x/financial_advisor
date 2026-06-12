import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Filter,
  MoreVertical,
  RotateCcw,
  Search,
  XCircle,
  SkipForward,
  TrendingUp,
} from "lucide-react";
import { Button, Card, Input, Text, cn } from "../../../shared/ui";
import type { BillOccurrence, BillOccurrencesPage } from "../types/bill.types";
import { formatBillDate, formatCurrency } from "../utils/bill.formatters";
import BillStatusBadge from "./BillStatusBadge";

type BillsTableProps = {
  page?: BillOccurrencesPage;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  search: string;
  status: string;
  sortBy: string;
  pageNumber: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onPay: (bill: BillOccurrence) => void;
  onTopUp: (bill: BillOccurrence) => void;
  onSkip: (bill: BillOccurrence) => void;
  onCancel: (bill: BillOccurrence) => void;
  onRefund: (bill: BillOccurrence) => void;
};

const STATUS_OPTIONS = [
  ["all", "All statuses"],
  ["Scheduled", "Scheduled"],
  ["Paid", "Paid"],
  ["Skipped", "Skipped"],
  ["Cancelled", "Cancelled"],
];

const SORT_OPTIONS = [
  ["dueDate", "Due Date"],
  ["amount", "Amount"],
  ["billName", "Bill Name"],
  ["status", "Status"],
];

function BillsTable({
  page,
  isLoading,
  isError,
  errorMessage,
  search,
  status,
  sortBy,
  pageNumber,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onPageChange,
  onPay,
  onTopUp,
  onSkip,
  onCancel,
  onRefund,
}: BillsTableProps) {
  const rows = page?.items ?? [];
  const totalCount = page?.totalCount ?? 0;
  const pageSize = page?.pageSize ?? 4;
  const currentPage = page?.pageNumber ?? pageNumber;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!openMenuId) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      setOpenMenuId(null);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenuId(null);
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenuId]);

  const runMenuAction = (action: (bill: BillOccurrence) => void, bill: BillOccurrence) => {
    setOpenMenuId(null);
    action(bill);
  };

  return (
    <Card padding="md">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Text as="h2" variant="subtitle" weight="bold" className="text-lg text-black">
          Occurrences
        </Text>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search occurrences..."
              className="pl-10"
            />
          </div>
          <div className="relative">
            <Filter size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <select
              value={status}
              onChange={(event) => onStatusChange(event.target.value)}
              className="h-10 rounded-lg border border-gray-300 bg-surface pl-9 pr-8 text-sm font-semibold text-text-secondary outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary/40"
            >
              {STATUS_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <select
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value)}
            className="h-10 rounded-lg border border-gray-300 bg-surface px-3 text-sm font-semibold text-text-secondary outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary/40"
          >
            {SORT_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                Sort by: {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-3 py-6">
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      )}
      {isError && !isLoading && (
        <Text variant="body" className="py-8 text-rose-600">
          {errorMessage ?? "Failed to load occurrences."}
        </Text>
      )}
      {!isLoading && !isError && rows.length === 0 && (
        <div className="py-12 text-center text-sm text-gray-500">No occurrences found.</div>
      )}
      {!isLoading && !isError && rows.length > 0 && (
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="py-3">Bill Name</th>
                <th className="py-3">Category</th>
                <th className="py-3">Due Date</th>
                <th className="py-3">Amount</th>
                <th className="py-3">Status</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((bill) => {
                const isMenuOpen = openMenuId === bill.occurrenceId;

                return (
                  <tr key={bill.occurrenceId} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 font-bold text-text-primary">{bill.billName}</td>
                    <td className="py-3">
                      <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                        {bill.category}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays size={15} />
                        {formatBillDate(bill.dueDate)}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-text-primary">{formatCurrency(bill.amount)}</td>
                    <td className="py-3">
                      <BillStatusBadge status={bill.displayStatus || bill.status} />
                    </td>
                    <td className="py-3">
                      <div
                        ref={isMenuOpen ? menuRef : null}
                        className="relative flex justify-end"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          shape="circle"
                          aria-label={`Open ${bill.billName} actions`}
                          onClick={() =>
                            setOpenMenuId((currentId) =>
                              currentId === bill.occurrenceId ? null : bill.occurrenceId,
                            )
                          }
                        >
                          <MoreVertical size={18} />
                        </Button>

                        {isMenuOpen && (
                          <div className="absolute right-0 top-10 z-50 w-40 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-xl">
                            {bill.canRecordPayment && (
                              <ActionMenuItem
                                icon={<CreditCard size={15} />}
                                label="Pay"
                                onClick={() => runMenuAction(onPay, bill)}
                              />
                            )}
                            {bill.canSkip && (
                              <ActionMenuItem
                                icon={<SkipForward size={15} />}
                                label="Skip"
                                onClick={() => runMenuAction(onSkip, bill)}
                              />
                            )}
                            {bill.canTopUp && (
                              <ActionMenuItem
                                icon={<TrendingUp size={15} />}
                                label="Top Up"
                                onClick={() => runMenuAction(onTopUp, bill)}
                              />
                            )}
                            {bill.canCancel && (
                              <ActionMenuItem
                                icon={<XCircle size={15} />}
                                label="Cancel"
                                tone="danger"
                                onClick={() => runMenuAction(onCancel, bill)}
                              />
                            )}
                            {(bill.status === "Paid" || bill.displayStatus === "Paid") && (
                              <ActionMenuItem
                                icon={<RotateCcw size={15} />}
                                label="Refund"
                                onClick={() => runMenuAction(onRefund, bill)}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-5 flex items-center justify-center gap-2">
        <Button
          type="button"
          variant="ghost"
          shape="circle"
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          aria-label="Previous occurrences page"
        >
          <ChevronLeft size={18} />
        </Button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <Button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            variant={page === currentPage ? "primary" : "secondary"}
            size="sm"
            className="h-9 w-9 rounded-lg"
          >
            {page}
          </Button>
        ))}
        <Button
          type="button"
          variant="ghost"
          shape="circle"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          aria-label="Next occurrences page"
        >
          <ChevronRight size={18} />
        </Button>
      </div>
    </Card>
  );
}

function ActionMenuItem({
  icon,
  label,
  tone = "default",
  onClick,
}: {
  icon: ReactNode;
  label: string;
  tone?: "default" | "danger";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium transition hover:bg-background hover:bg-gray-100",
        tone === "danger" ? "text-rose-600" : "text-text-secondary",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

export default BillsTable;
