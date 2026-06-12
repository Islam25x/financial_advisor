import { CalendarDays, CreditCard, Repeat2, Tag, Wifi } from "lucide-react";
import { Button, Card, Text } from "../../../shared/ui";
import type { BillNextBill } from "../types/bill.types";
import { formatBillDate, formatCurrency, getStatusLabel } from "../utils/bill.formatters";

type NextBillCardProps = {
  bill: BillNextBill | null | undefined;
  isLoading?: boolean;
  onPayNow: (bill: BillNextBill) => void;
};

function NextBillCard({ bill, isLoading = false, onPayNow }: NextBillCardProps) {
  return (
    <Card padding="md" className="h-full">
      <Text as="h2" variant="subtitle" weight="bold" className="mb-3 text-lg text-black">
        Next Bill
      </Text>
      {isLoading && <div className="h-72 animate-pulse rounded-xl bg-slate-100" />}
      {!isLoading && !bill && (
        <div className="flex h-72 items-center justify-center text-sm text-gray-500">
          No upcoming bill found.
        </div>
      )}
      {!isLoading && bill && (
        <div className="overflow-hidden rounded-xl border border-orange-100">
          <div className="bg-orange-50 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-500">
                <Wifi size={38} />
              </div>
              <div>
                <Text as="h3" variant="subtitle" weight="bold" className="text-black">
                  {bill.billName}
                </Text>
                <div className="mt-1 text-3xl font-bold text-text-primary">
                  {formatCurrency(bill.amount)}
                </div>
                <span className="mt-2 inline-flex rounded-md bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-600">
                  {getStatusLabel(bill.paymentStatus)}
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-3 p-5 text-sm">
            {[
              [CalendarDays, "Due Date", formatBillDate(bill.dueDate)],
              [Tag, "Category", bill.category],
              [Repeat2, "Frequency", bill.frequency],
              [CreditCard, "Payment Status", getStatusLabel(bill.paymentStatus)],
            ].map(([Icon, label, value]) => {
              const RowIcon = Icon as typeof CalendarDays;
              return (
                <div key={label as string} className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2 font-semibold text-gray-600">
                    <RowIcon size={16} />
                    {label as string}
                  </span>
                  <span className="text-right font-semibold text-text-primary">{value as string}</span>
                </div>
              );
            })}
            <Button
              type="button"
              className="mt-2 w-full bg-orange-500 hover:bg-orange-600"
              disabled={!bill.canRecordPayment}
              onClick={() => onPayNow(bill)}
            >
              Pay Now
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export default NextBillCard;
