import { useEffect, useRef } from "react";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { addTransactionApi } from "../api/add-transaction.api";
import type { AddTransactionInput } from "../types/add-transaction.types";
import { parseAddTransactionPayload } from "../utils/add-transaction.parser";
import { ApiError } from "../../../infrastructure/api/api-error";
import { invalidateTransactionDomainQueries } from "../../../infrastructure/query/invalidation/transaction-invalidation";

type AddTransactionMutation = UseMutationResult<void, ApiError, AddTransactionInput>;

type UseAddTransactionResult = AddTransactionMutation & {
  cancel: () => void;
};

export function useAddTransaction(): UseAddTransactionResult {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation<void, ApiError, AddTransactionInput>({
    mutationKey: ["transactions", "add"],
    mutationFn: async (payload) => {
      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        await addTransactionApi(parseAddTransactionPayload(payload), {
          signal: controller.signal,
        });
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    onSuccess: async () => {
      await invalidateTransactionDomainQueries(queryClient);
    },
    retry: 0,
  });

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    ...mutation,
    cancel: () => abortControllerRef.current?.abort(),
  };
}
