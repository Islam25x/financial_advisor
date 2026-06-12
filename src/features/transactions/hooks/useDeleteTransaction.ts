import { useEffect, useRef } from "react";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { deleteTransactionApi } from "../api/delete-transaction.api";
import { ApiError } from "../../../infrastructure/api/api-error";
import { invalidateTransactionDomainQueries } from "../../../infrastructure/query/invalidation/transaction-invalidation";

type DeleteTransactionMutation = UseMutationResult<void, ApiError, string>;

type UseDeleteTransactionResult = DeleteTransactionMutation & {
  cancel: () => void;
};

export function useDeleteTransaction(): UseDeleteTransactionResult {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation<void, ApiError, string>({
    mutationKey: ["transactions", "delete"],
    mutationFn: async (transactionId) => {
      const normalizedTransactionId = transactionId.trim();

      if (!normalizedTransactionId) {
        throw new ApiError("Transaction id is required.", 400, "INVALID_RESPONSE");
      }

      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        await deleteTransactionApi(normalizedTransactionId, {
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
