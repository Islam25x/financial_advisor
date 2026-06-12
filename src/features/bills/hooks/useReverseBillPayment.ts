import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { getBillDetailsApi, reverseBillPaymentApi } from "../api/bill.api";
import type { BillOccurrence } from "../types/bill.types";
import { parseBillDetails } from "../utils/bill.parser";
import { billQueryKeys } from "./bill-query-keys";
import { invalidateBillQueries } from "./invalidate-bill-queries";

type ReverseBillPaymentInput = {
  occurrence: BillOccurrence;
} | {
  paymentId: string;
  billSeriesId: string;
};

export function useReverseBillPayment() {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation<void, ApiError, ReverseBillPaymentInput>({
    mutationKey: ["bills", "reverse-payment"],
    mutationFn: async (input) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        if ("paymentId" in input) {
          await reverseBillPaymentApi(input.paymentId, { signal: controller.signal });
          return;
        }

        const { occurrence } = input;
        const details = parseBillDetails(
          await getBillDetailsApi(occurrence.billSeriesId, {
            signal: controller.signal,
          }),
        );
        const payment = details.payments.find(
          (item) =>
            item.billOccurrenceId === occurrence.occurrenceId &&
            item.status === "Completed" &&
            item.reversedAt === null,
        );

        if (!payment) {
          throw new ApiError(
            "No completed payment found for this occurrence.",
            404,
            "INVALID_RESPONSE",
          );
        }

        await reverseBillPaymentApi(payment.id, { signal: controller.signal });
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    onSuccess: async (_, input) => {
      const billSeriesId = "paymentId" in input ? input.billSeriesId : input.occurrence.billSeriesId;

      await Promise.all([
        invalidateBillQueries(queryClient),
        queryClient.invalidateQueries({
          queryKey: billQueryKeys.details(billSeriesId),
        }),
      ]);
    },
    retry: 0,
  });

  useEffect(() => () => abortControllerRef.current?.abort(), []);

  return {
    ...mutation,
    cancel: () => abortControllerRef.current?.abort(),
  };
}
