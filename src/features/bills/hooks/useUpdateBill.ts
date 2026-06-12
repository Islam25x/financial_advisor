import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { updateBillApi } from "../api/bill.api";
import type { UpdateBillInput } from "../types/bill.types";
import { invalidateBillQueries } from "./invalidate-bill-queries";
import { billQueryKeys } from "./bill-query-keys";

type UpdateBillPayload = {
  billSeriesId: string;
  input: UpdateBillInput;
};

export function useUpdateBill() {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation<void, ApiError, UpdateBillPayload>({
    mutationKey: ["bills", "update"],
    mutationFn: async ({ billSeriesId, input }) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        await updateBillApi(billSeriesId, input, { signal: controller.signal });
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        invalidateBillQueries(queryClient),
        queryClient.invalidateQueries({
          queryKey: billQueryKeys.details(variables.billSeriesId),
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
