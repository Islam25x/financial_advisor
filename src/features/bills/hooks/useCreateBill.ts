import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { createBillApi } from "../api/bill.api";
import type { CreateBillInput } from "../types/bill.types";
import { invalidateBillQueries } from "./invalidate-bill-queries";

export function useCreateBill() {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation<void, ApiError, CreateBillInput>({
    mutationKey: ["bills", "create"],
    mutationFn: async (input) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        await createBillApi(input, { signal: controller.signal });
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
