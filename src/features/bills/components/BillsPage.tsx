import { useState } from "react";
import { Plus } from "lucide-react";
import { Button, FinancialSummaryCards, PageHeader, cn, useToast } from "../../../shared/ui";
import type { Bill, BillNextBill, BillOccurrence, BillPayment } from "../types/bill.types";
import { useBillCalendar } from "../hooks/useBillCalendar";
import { useBillOccurrences } from "../hooks/useBillOccurrences";
import { useBillSummary } from "../hooks/useBillSummary";
import { useBills } from "../hooks/useBills";
import { useBillActions } from "../hooks/useBillActions";
import { useBillDetails } from "../hooks/useBillDetails";
import { mapBillSummaryToFinancialSummary } from "../utils/bill-summary-metrics";
import BillsCalendar from "./BillsCalendar";
import BillsTable from "./BillsTable";
import BillSeriesTable from "./BillSeriesTable";
import NextBillCard from "./NextBillCard";
import RecordPaymentModal from "./RecordPaymentModal";
import AddBillModal from "./AddBillModal";
import BillConfirmDialog from "./BillConfirmDialog";
import BillHistoryModal from "./BillHistoryModal";

const PAGE_SIZE = 4;
type ActiveTab = "occurrences" | "bills";
type ConfirmAction = {
  type: "skip" | "cancel" | "refund";
  occurrence: BillOccurrence;
} | {
  type: "delete";
  bill: Bill;
} | null;

function BillsPage() {
  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [pageNumber, setPageNumber] = useState(1);
  const [paymentTarget, setPaymentTarget] = useState<BillNextBill | BillOccurrence | null>(null);
  const [topUpTarget, setTopUpTarget] = useState<BillOccurrence | null>(null);
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [editingBillSeriesId, setEditingBillSeriesId] = useState<string | null>(null);
  const [historyBillSeriesId, setHistoryBillSeriesId] = useState<string | null>(null);
  const [reversingHistoryPaymentId, setReversingHistoryPaymentId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("occurrences");
  const { showToast } = useToast();

  const summaryQuery = useBillSummary();
  const billsQuery = useBills();
  const calendarQuery = useBillCalendar(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth() + 1,
  );
  const occurrencesQuery = useBillOccurrences({
    search,
    status,
    sortBy,
    sortDirection: "asc",
    pageNumber,
    pageSize: PAGE_SIZE,
  });
  const billActions = useBillActions();
  const cachedPaymentBill = billsQuery.data?.find(
    (bill) => bill.id === paymentTarget?.billSeriesId,
  );
  const paymentTargetAmountType =
    paymentTarget?.amountType ?? cachedPaymentBill?.amountType ?? null;
  const paymentDetailsQuery = useBillDetails(
    paymentTarget?.billSeriesId ?? null,
    paymentTarget !== null && paymentTargetAmountType === null,
  );
  const resolvedPaymentAmountType =
    paymentTargetAmountType ?? paymentDetailsQuery.data?.amountType ?? null;

  const handlePaymentSubmit = async (input: {
    amount: number;
    paidAt: string;
    notes: string;
  }) => {
    if (!paymentTarget) return;

    try {
      await billActions.recordPayment.mutateAsync({
        occurrenceId: paymentTarget.occurrenceId,
        amount: input.amount,
        paidAt: input.paidAt,
        notes: input.notes,
      });
      showToast({ message: "Payment recorded successfully.", tone: "success" });

      setPaymentTarget(null);
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Bill action failed.",
        tone: "error",
      });
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    try {
      if (confirmAction.type === "skip") {
        await billActions.skipOccurrence.mutateAsync({
          occurrenceId: confirmAction.occurrence.occurrenceId,
        });
        showToast({ message: "Occurrence skipped successfully.", tone: "success" });
      } else if (confirmAction.type === "cancel") {
        await billActions.cancelOccurrence.mutateAsync({
          occurrenceId: confirmAction.occurrence.occurrenceId,
        });
        showToast({ message: "Occurrence cancelled successfully.", tone: "success" });
      } else if (confirmAction.type === "refund") {
        await billActions.reversePayment.mutateAsync({
          occurrence: confirmAction.occurrence,
        });
        showToast({ message: "Payment refunded successfully.", tone: "success" });
      } else if (confirmAction.type === "delete") {
        await billActions.deleteBill.mutateAsync(confirmAction.bill.id);
        showToast({ message: "Bill deleted successfully.", tone: "success" });
      }

      setConfirmAction(null);
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Bill action failed.",
        tone: "error",
      });
    }
  };

  const handleTopUpSubmit = async (input: {
    amount: number;
    paidAt: string;
    notes: string;
  }) => {
    if (!topUpTarget) return;

    try {
      await billActions.topUp.mutateAsync({
        billSeriesId: topUpTarget.billSeriesId,
        amount: input.amount,
        paidAt: input.paidAt,
        notes: input.notes || null,
      });
      showToast({ message: "Bill topped up successfully.", tone: "success" });
      setTopUpTarget(null);
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Bill action failed.",
        tone: "error",
      });
    }
  };

  const handleHistoryReversePayment = async (payment: BillPayment) => {
    setReversingHistoryPaymentId(payment.id);

    try {
      await billActions.reversePayment.mutateAsync({
        paymentId: payment.id,
        billSeriesId: payment.billSeriesId,
      });
      showToast({ message: "Payment refunded successfully.", tone: "success" });
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Bill action failed.",
        tone: "error",
      });
    } finally {
      setReversingHistoryPaymentId(null);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Bills"
        subtitle="Track and manage all your bills in one place."
      />
      <Button
            type="button"
            className="self-start"
            onClick={() => {
              setEditingBillSeriesId(null);
              setIsAddBillOpen(true);
            }}
          >
            <Plus size={17} />
            Add Bill
          </Button>
      <FinancialSummaryCards
        summary={mapBillSummaryToFinancialSummary(summaryQuery.data)}
        isLoading={summaryQuery.isLoading}
        isError={summaryQuery.isError}
        titles={{
          balance: "Total Bills",
          income: "Due This Week",
          expenses: "Paid This Month",
          savings: "Overdue",
        }}
        arrows={{
          balance: false,
          income: false,
          expenses: false,
          savings: false,
        }}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <BillsCalendar
          month={calendarMonth}
          selectedDate={selectedDate}
          occurrences={calendarQuery.data ?? []}
          isLoading={calendarQuery.isLoading}
          isError={calendarQuery.isError}
          errorMessage={calendarQuery.error?.message}
          onMonthChange={(month) =>
            setCalendarMonth(new Date(month.getFullYear(), month.getMonth(), 1))
          }
          onSelectDate={setSelectedDate}
        />
        <NextBillCard
          bill={summaryQuery.data?.nextBill}
          isLoading={summaryQuery.isLoading}
          onPayNow={setPaymentTarget}
        />
      </div>

      <div className="flex gap-2 rounded-xl border border-border bg-surface p-1">
        {(["occurrences", "bills"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition",
              activeTab === tab
                ? "bg-primary text-white"
                : "text-text-secondary hover:bg-background",
            )}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "occurrences" ? "Occurrences" : "Bills"}
          </button>
        ))}
      </div>

      {activeTab === "occurrences" ? (
        <BillsTable
          page={occurrencesQuery.data}
          isLoading={occurrencesQuery.isLoading}
          isError={occurrencesQuery.isError}
          errorMessage={occurrencesQuery.error?.message}
          search={search}
          status={status}
          sortBy={sortBy}
          pageNumber={pageNumber}
          onSearchChange={(value) => {
            setSearch(value);
            setPageNumber(1);
          }}
          onStatusChange={(value) => {
            setStatus(value);
            setPageNumber(1);
          }}
          onSortChange={(value) => {
            setSortBy(value);
            setPageNumber(1);
          }}
          onPageChange={setPageNumber}
          onPay={setPaymentTarget}
          onTopUp={setTopUpTarget}
          onSkip={(occurrence) => setConfirmAction({ type: "skip", occurrence })}
          onCancel={(occurrence) => setConfirmAction({ type: "cancel", occurrence })}
          onRefund={(occurrence) => setConfirmAction({ type: "refund", occurrence })}
        />
      ) : (
        <BillSeriesTable
          bills={billsQuery.data ?? []}
          isLoading={billsQuery.isLoading}
          isError={billsQuery.isError}
          errorMessage={billsQuery.error?.message}
          onEdit={(bill) => {
            setEditingBillSeriesId(bill.id);
            setIsAddBillOpen(true);
          }}
          onDelete={(bill) => setConfirmAction({ type: "delete", bill })}
          onHistory={(bill) => setHistoryBillSeriesId(bill.id)}
        />
      )}

      <RecordPaymentModal
        bill={paymentTarget}
        isOpen={paymentTarget !== null}
        mode="payment"
        amountType={resolvedPaymentAmountType}
        isSubmitting={billActions.recordPayment.isPending}
        errorMessage={billActions.recordPayment.error?.message}
        onClose={() => setPaymentTarget(null)}
        onSubmit={handlePaymentSubmit}
      />
      <RecordPaymentModal
        bill={topUpTarget}
        isOpen={topUpTarget !== null}
        mode="topup"
        isSubmitting={billActions.topUp.isPending}
        errorMessage={billActions.topUp.error?.message}
        onClose={() => setTopUpTarget(null)}
        onSubmit={handleTopUpSubmit}
      />
      <AddBillModal
        isOpen={isAddBillOpen}
        mode={editingBillSeriesId ? "edit" : "create"}
        billSeriesId={editingBillSeriesId}
        onClose={() => {
          setIsAddBillOpen(false);
          setEditingBillSeriesId(null);
        }}
      />
      <BillConfirmDialog
        isOpen={confirmAction !== null}
        title={getConfirmTitle(confirmAction)}
        description={getConfirmDescription(confirmAction)}
        confirmLabel={getConfirmLabel(confirmAction)}
        tone={confirmAction?.type === "delete" || confirmAction?.type === "cancel" ? "danger" : "default"}
        isSubmitting={getConfirmPending(confirmAction, billActions)}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirmAction}
      />
      <BillHistoryModal
        isOpen={historyBillSeriesId !== null}
        billSeriesId={historyBillSeriesId}
        reversingPaymentId={reversingHistoryPaymentId}
        onClose={() => setHistoryBillSeriesId(null)}
        onReversePayment={handleHistoryReversePayment}
      />
    </div>
  );
}

function getConfirmTitle(confirmAction: ConfirmAction): string {
  if (confirmAction?.type === "delete") return "Delete Bill?";
  if (confirmAction?.type === "cancel") return "Cancel Occurrence?";
  if (confirmAction?.type === "refund") return "Refund Payment?";
  return "Skip Occurrence?";
}

function getConfirmDescription(confirmAction: ConfirmAction): string {
  if (confirmAction?.type === "delete") {
    return "This will permanently delete this recurring bill and all future occurrences.";
  }
  if (confirmAction?.type === "cancel") return "This payable occurrence will be cancelled.";
  if (confirmAction?.type === "refund") {
    return "This will find the completed payment for this occurrence and reverse it.";
  }
  return "This occurrence will be skipped.";
}

function getConfirmLabel(confirmAction: ConfirmAction): string {
  if (confirmAction?.type === "delete") return "Delete";
  if (confirmAction?.type === "cancel") return "Cancel Occurrence";
  if (confirmAction?.type === "refund") return "Refund";
  return "Skip";
}

function getConfirmPending(
  confirmAction: ConfirmAction,
  billActions: ReturnType<typeof useBillActions>,
): boolean {
  if (confirmAction?.type === "delete") return billActions.deleteBill.isPending;
  if (confirmAction?.type === "cancel") return billActions.cancelOccurrence.isPending;
  if (confirmAction?.type === "refund") return billActions.reversePayment.isPending;
  return billActions.skipOccurrence.isPending;
}

export default BillsPage;
