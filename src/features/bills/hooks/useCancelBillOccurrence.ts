import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { cancelBillOccurrenceApi } from "../api/bill.api";
import type { OccurrenceNotesInput } from "../types/bill.types";
import { invalidateBillQueries } from "./invalidate-bill-queries";

export function useCancelBillOccurrence() {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation<void, ApiError, OccurrenceNotesInput>({
    mutationKey: ["bills", "cancel-occurrence"],
    mutationFn: async (input) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        await cancelBillOccurrenceApi(input, { signal: controller.signal });
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
