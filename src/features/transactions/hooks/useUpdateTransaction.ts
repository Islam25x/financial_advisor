import { useEffect, useRef } from "react";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { updateTransactionApi } from "../api/update-transaction.api";
import type { AddTransactionInput } from "../types/add-transaction.types";
import { parseAddTransactionPayload } from "../utils/add-transaction.parser";
import { ApiError } from "../../../infrastructure/api/api-error";
import { invalidateTransactionDomainQueries } from "../../../infrastructure/query/invalidation/transaction-invalidation";

type UpdateTransactionPayload = {
  transactionId: string;
  input: AddTransactionInput;
};

type UpdateTransactionMutation = UseMutationResult<
  void,
  ApiError,
  UpdateTransactionPayload
>;

type UseUpdateTransactionResult = UpdateTransactionMutation & {
  cancel: () => void;
};

export function useUpdateTransaction(): UseUpdateTransactionResult {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation<void, ApiError, UpdateTransactionPayload>({
    mutationKey: ["transactions", "update"],
    mutationFn: async ({ transactionId, input }) => {
      const normalizedTransactionId = transactionId.trim();

      if (!normalizedTransactionId) {
        throw new ApiError("Transaction id is required.", 400, "INVALID_RESPONSE");
      }

      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        await updateTransactionApi(
          normalizedTransactionId,
          parseAddTransactionPayload(input),
          { signal: controller.signal },
        );
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
