import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button, Input, Text } from "../../../shared/ui";
import type { BillAmountType, BillNextBill, BillOccurrence } from "../types/bill.types";
import { formatCurrency } from "../utils/bill.formatters";

type PayableBill = BillNextBill | BillOccurrence;

type RecordPaymentModalProps = {
  bill: PayableBill | null;
  isOpen: boolean;
  mode?: "payment" | "topup";
  amountType?: BillAmountType | null;
  isSubmitting?: boolean;
  errorMessage?: string;
  onClose: () => void;
  onSubmit: (input: { amount: number; paidAt: string; notes: string }) => Promise<void>;
};

function getDateTimeLocalValue(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

function RecordPaymentModal({
  bill,
  isOpen,
  mode = "payment",
  amountType = null,
  isSubmitting = false,
  errorMessage,
  onClose,
  onSubmit,
}: RecordPaymentModalProps) {
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(getDateTimeLocalValue());
  const [notes, setNotes] = useState("");
  const [amountError, setAmountError] = useState("");

  useEffect(() => {
    if (!isOpen || !bill) return;
    setAmount(amountType === "Variable" && bill.amount <= 0 ? "" : String(bill.amount));
    setPaymentDate(getDateTimeLocalValue());
    setNotes("");
    setAmountError("");
  }, [amountType, bill, isOpen]);

  if (!isOpen || !bill) return null;
  const isTopUpMode = mode === "topup";
  const isVariableAmount = amountType === "Variable";
  const isFixedAmount = amountType === "Fixed" && !isTopUpMode;
  const resolvedAmount = isFixedAmount ? bill.amount : Number(amount);

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <Text as="h2" variant="subtitle" weight="bold" className="text-xl text-black">
              {isTopUpMode ? "Top Up Bill" : "Record Payment"}
            </Text>
            <Text variant="body" className="text-sm text-gray-500">
              {bill.billName} · {formatCurrency(bill.amount)}
            </Text>
          </div>
          <Button type="button" variant="ghost" shape="circle" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </Button>
        </div>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if ((isVariableAmount || isTopUpMode) && (!Number.isFinite(resolvedAmount) || resolvedAmount <= 0)) {
              setAmountError("Amount must be greater than zero.");
              return;
            }

            void onSubmit({
              amount: resolvedAmount,
              paidAt: new Date(paymentDate).toISOString(),
              notes,
            });
          }}
        >
          <Input
            label="Amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value);
              setAmountError("");
            }}
            disabled={isFixedAmount || isSubmitting}
            error={amountError}
            required
          />
          <Input
            label="Payment Date"
            type="datetime-local"
            value={paymentDate}
            onChange={(event) => setPaymentDate(event.target.value)}
            required
          />
          <Input
            label="Notes"
            as="textarea"
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Optional payment note"
          />
          {errorMessage && <p className="text-sm font-medium text-rose-600">{errorMessage}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isTopUpMode ? "Top Up" : "Submit Payment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RecordPaymentModal;
