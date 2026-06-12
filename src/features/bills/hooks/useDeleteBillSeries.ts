import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { deleteBillSeriesApi } from "../api/bill.api";
import { invalidateBillQueries } from "./invalidate-bill-queries";

export function useDeleteBillSeries() {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation<void, ApiError, string>({
    mutationKey: ["bills", "delete-series"],
    mutationFn: async (billSeriesId) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        await deleteBillSeriesApi(billSeriesId, { signal: controller.signal });
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    onSuccess: async () => {
      await invalidateBillQueries(queryClient);
    },
    retry: 0,
  });

  useEffect(() => () => abortControllerRef.current?.abort(), []);

  return {
    ...mutation,
    cancel: () => abortControllerRef.current?.abort(),
  };
}
