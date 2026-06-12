import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { topUpBillApi } from "../api/bill.api";
import type { TopUpBillInput } from "../types/bill.types";
import { billQueryKeys } from "./bill-query-keys";
import { invalidateBillQueries } from "./invalidate-bill-queries";

export function useTopUpBill() {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation<void, ApiError, TopUpBillInput>({
    mutationKey: ["bills", "top-up"],
    mutationFn: async (input) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        await topUpBillApi(input, { signal: controller.signal });
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    onSuccess: async (_, input) => {
      await Promise.all([
        invalidateBillQueries(queryClient),
        queryClient.invalidateQueries({
          queryKey: billQueryKeys.details(input.billSeriesId),
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
