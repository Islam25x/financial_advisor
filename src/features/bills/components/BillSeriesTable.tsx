import { useEffect, useRef, useState, type ReactNode } from "react";
import { CalendarDays, Edit3, History, MoreVertical, Trash2 } from "lucide-react";
import { Button, Card, Text, cn } from "../../../shared/ui";
import type { Bill } from "../types/bill.types";
import { formatBillDate, formatCurrency } from "../utils/bill.formatters";
import BillStatusBadge from "./BillStatusBadge";

type BillSeriesTableProps = {
  bills: Bill[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onEdit: (bill: Bill) => void;
  onDelete: (bill: Bill) => void;
  onHistory: (bill: Bill) => void;
};

function formatDueValue(bill: Bill): string {
  if (bill.dueDate) return formatBillDate(bill.dueDate);
  if ((bill.dueDay ?? 0) > 0) return `Day ${bill.dueDay}`;
  return "-";
}

function BillSeriesTable({
  bills,
  isLoading,
  isError,
  errorMessage,
  onEdit,
  onDelete,
  onHistory,
}: BillSeriesTableProps) {
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

  const runMenuAction = (action: (bill: Bill) => void, bill: Bill) => {
    setOpenMenuId(null);
    action(bill);
  };

  return (
    <Card padding="md">
      <div className="mb-4 flex items-center justify-between">
        <Text as="h2" variant="subtitle" weight="bold" className="text-lg text-black">
          Bills
        </Text>
      </div>

      {isLoading && (
        <div className="space-y-3 py-6">
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      )}
      {isError && !isLoading && (
        <Text variant="body" className="py-8 text-rose-600">
          {errorMessage ?? "Failed to load bills."}
        </Text>
      )}
      {!isLoading && !isError && bills.length === 0 && (
        <div className="py-12 text-center text-sm text-gray-500">No bills found.</div>
      )}
      {!isLoading && !isError && bills.length > 0 && (
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="py-3">Bill Name</th>
                <th className="py-3">Category</th>
                <th className="py-3">Frequency</th>
                <th className="py-3">Default Amount</th>
                <th className="py-3">Due Day / Due Date</th>
                <th className="py-3">Current Status</th>
                <th className="py-3">Active</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => {
                const isMenuOpen = openMenuId === bill.id;
                const currentStatus = bill.currentOccurrence?.displayStatus;

                return (
                  <tr key={bill.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 font-bold text-text-primary">{bill.name}</td>
                    <td className="py-3">
                      <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        {bill.categoryName}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600">{bill.frequency || "-"}</td>
                    <td className="py-3 font-bold text-text-primary">
                      {formatCurrency(bill.defaultAmount ?? 0)}
                    </td>
                    <td className="py-3 text-gray-600">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays size={15} />
                        {formatDueValue(bill)}
                      </span>
                    </td>
                    <td className="py-3">
                      {currentStatus ? (
                        <BillStatusBadge status={currentStatus} />
                      ) : (
                        <span className="text-sm text-text-muted">-</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className="inline-flex rounded-md bg-background px-2.5 py-1 text-xs font-semibold text-text-secondary">
                        {bill.isActive ? "Active" : "Inactive"}
                      </span>
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
                          aria-label={`Open ${bill.name} actions`}
                          onClick={() =>
                            setOpenMenuId((currentId) =>
                              currentId === bill.id ? null : bill.id,
                            )
                          }
                        >
                          <MoreVertical size={18} />
                        </Button>

                        {isMenuOpen && (
                          <div className="absolute right-0 top-10 z-50 w-40 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-xl">
                            <ActionMenuItem
                              icon={<Edit3 size={15} />}
                              label="Edit"
                              onClick={() => runMenuAction(onEdit, bill)}
                            />
                            <ActionMenuItem
                              icon={<History size={15} />}
                              label="History"
                              onClick={() => runMenuAction(onHistory, bill)}
                            />
                            <ActionMenuItem
                              icon={<Trash2 size={15} />}
                              label="Delete"
                              tone="danger"
                              onClick={() => runMenuAction(onDelete, bill)}
                            />
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
        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium transition hover:bg-background",
        tone === "danger" ? "text-rose-600" : "text-text-secondary",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

export default BillSeriesTable;
