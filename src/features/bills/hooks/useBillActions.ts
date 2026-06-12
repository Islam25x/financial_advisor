import { useCancelBillOccurrence } from "./useCancelBillOccurrence";
import { useDeleteBillSeries } from "./useDeleteBillSeries";
import { useRecordBillPayment } from "./useRecordBillPayment";
import { useReverseBillPayment } from "./useReverseBillPayment";
import { useSkipBillOccurrence } from "./useSkipBillOccurrence";
import { useTopUpBill } from "./useTopUpBill";

export function useBillActions() {
  return {
    recordPayment: useRecordBillPayment(),
    topUp: useTopUpBill(),
    skipOccurrence: useSkipBillOccurrence(),
    cancelOccurrence: useCancelBillOccurrence(),
    deleteBill: useDeleteBillSeries(),
    reversePayment: useReverseBillPayment(),
  };
}
