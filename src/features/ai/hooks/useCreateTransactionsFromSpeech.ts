import { useEffect, useRef } from "react";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { invalidateTransactionDomainQueries } from "../../../infrastructure/query/invalidation/transaction-invalidation";
import type { CreateTransactionsFromSpeechResponseDto } from "../api/speech.dto";
import { createTransactionsFromSpeechApi } from "../api/ai.api";

type CreateTransactionsFromSpeechMutation = UseMutationResult<
  CreateTransactionsFromSpeechResponseDto,
  ApiError,
  string
>;

type UseCreateTransactionsFromSpeechResult =
  CreateTransactionsFromSpeechMutation & {
    cancel: () => void;
  };

export function useCreateTransactionsFromSpeech(): UseCreateTransactionsFromSpeechResult {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation<
    CreateTransactionsFromSpeechResponseDto,
    ApiError,
    string
  >({
    mutationKey: ["transactions", "speech-create"],
    mutationFn: async (text) => {
      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        return await createTransactionsFromSpeechApi(text, {
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
