import { RotateCcw, X } from "lucide-react";
import type { ReactNode } from "react";
import { Button, Text } from "../../../shared/ui";
import { useBillDetails } from "../hooks/useBillDetails";
import type { BillPayment } from "../types/bill.types";
import { formatBillDate, formatCurrency } from "../utils/bill.formatters";
import BillStatusBadge from "./BillStatusBadge";

type BillHistoryModalProps = {
  billSeriesId: string | null;
  isOpen: boolean;
  reversingPaymentId?: string | null;
  onClose: () => void;
  onReversePayment: (payment: BillPayment) => void;
};

function formatNullableDate(value: string | null): string {
  return value ? formatBillDate(value) : "-";
}

function canReversePayment(payment: BillPayment): boolean {
  return Boolean(payment.id) && payment.status === "Completed" && payment.reversedAt === null;
}

function BillHistoryModal({
  billSeriesId,
  isOpen,
  reversingPaymentId = null,
  onClose,
  onReversePayment,
}: BillHistoryModalProps) {
  const detailsQuery = useBillDetails(billSeriesId, isOpen);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1300] flex items-center justify-center bg-text-primary/25 p-4"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="bill-history-title"
        className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h3 id="bill-history-title" className="text-xl font-semibold text-text-primary">
              Bill History
            </h3>
            <Text variant="body" className="text-text-muted">
              {detailsQuery.data?.name ?? "Bill details"}
            </Text>
          </div>
          <Button type="button" variant="ghost" shape="circle" onClick={onClose} aria-label="Close history">
            <X size={20} />
          </Button>
        </div>

        <div className="max-h-[calc(90vh-82px)] space-y-5 overflow-y-auto p-5">
          {detailsQuery.isLoading && (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((row) => (
                <div key={row} className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          )}

          {detailsQuery.isError && !detailsQuery.isLoading && (
            <Text variant="body" className="text-rose-600">
              {detailsQuery.error?.message ?? "Failed to load bill history."}
            </Text>
          )}

          {detailsQuery.data && !detailsQuery.isLoading && !detailsQuery.isError && (
            <>
              <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <InfoItem label="Category" value={detailsQuery.data.categoryName} />
                <InfoItem label="Frequency" value={detailsQuery.data.frequency || "-"} />
                <InfoItem label="Default Amount" value={formatCurrency(detailsQuery.data.defaultAmount ?? 0)} />
                <InfoItem label="Active" value={detailsQuery.data.isActive ? "Active" : "Inactive"} />
                <InfoItem label="Start Date" value={formatNullableDate(detailsQuery.data.startDate)} />
                <InfoItem label="End Date" value={formatNullableDate(detailsQuery.data.endDate)} />
                <InfoItem
                  label="Due"
                  value={
                    detailsQuery.data.dueDate
                      ? formatBillDate(detailsQuery.data.dueDate)
                      : (detailsQuery.data.dueDay ?? 0) > 0
                        ? `Day ${detailsQuery.data.dueDay}`
                        : "-"
                  }
                />
                <InfoItem label="Reminder" value={`${detailsQuery.data.reminderDaysBefore} days before`} />
              </section>

              <HistoryTable title="Occurrences">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500">
                    <th className="py-3">Title</th>
                    <th className="py-3">Due Date</th>
                    <th className="py-3">Amount</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Paid At</th>
                  </tr>
                </thead>
                <tbody>
                  {detailsQuery.data.occurrences.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-sm text-text-muted">
                        No occurrences found.
                      </td>
                    </tr>
                  ) : (
                    detailsQuery.data.occurrences.map((occurrence) => (
                      <tr key={occurrence.occurrenceId} className="border-b border-gray-100 last:border-0">
                        <td className="py-3 font-semibold text-text-primary">{occurrence.billName}</td>
                        <td className="py-3 text-gray-600">{formatBillDate(occurrence.dueDate)}</td>
                        <td className="py-3 font-semibold text-text-primary">
                          {formatCurrency(occurrence.amount)}
                        </td>
                        <td className="py-3">
                          <BillStatusBadge status={occurrence.displayStatus || occurrence.status} />
                        </td>
                        <td className="py-3 text-gray-600">{formatNullableDate(occurrence.paidAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </HistoryTable>

              <HistoryTable title="Payments">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500">
                    <th className="py-3">Payment Status</th>
                    <th className="py-3">Paid At</th>
                    <th className="py-3">Amount Paid</th>
                    <th className="py-3">Reversed At</th>
                    <th className="py-3">Reversal Info</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {detailsQuery.data.payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-sm text-text-muted">
                        No payments found.
                      </td>
                    </tr>
                  ) : (
                    detailsQuery.data.payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-gray-100 last:border-0">
                        <td className="py-3 font-semibold text-text-primary">{payment.status}</td>
                        <td className="py-3 text-gray-600">{formatNullableDate(payment.paidAt)}</td>
                        <td className="py-3 font-semibold text-text-primary">
                          {formatCurrency(payment.amountPaid)}
                        </td>
                        <td className="py-3 text-gray-600">{formatNullableDate(payment.reversedAt)}</td>
                        <td className="py-3 text-gray-600">{payment.reversalReason ?? "-"}</td>
                        <td className="py-3 text-right">
                          {canReversePayment(payment) && (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              loading={reversingPaymentId === payment.id}
                              onClick={() => onReversePayment(payment)}
                            >
                              <RotateCcw size={14} />
                              Refund
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </HistoryTable>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <Text variant="caption" className="text-text-muted">
        {label}
      </Text>
      <Text variant="body" weight="bold" className="text-text-primary">
        {value}
      </Text>
    </div>
  );
}

function HistoryTable({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <Text as="h4" variant="subtitle" weight="bold" className="mb-3 text-text-primary">
        {title}
      </Text>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">{children}</table>
      </div>
    </section>
  );
}

export default BillHistoryModal;
