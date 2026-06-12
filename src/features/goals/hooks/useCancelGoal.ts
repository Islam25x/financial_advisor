import { useEffect, useRef } from "react";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { invalidateGoalDomainQueries } from "../../../infrastructure/query/invalidation/goal-invalidation";
import { cancelGoalApi } from "../api/cancel-goal.api";

type CancelGoalMutation = UseMutationResult<void, ApiError, string>;

type UseCancelGoalResult = CancelGoalMutation & {
  cancel: () => void;
};

export function useCancelGoal(): UseCancelGoalResult {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation<void, ApiError, string>({
    mutationKey: ["goals", "cancel"],
    mutationFn: async (goalId) => {
      const normalizedGoalId = goalId.trim();
      if (!normalizedGoalId) {
        throw new ApiError("Goal id is required.", 400, "INVALID_RESPONSE");
      }

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        await cancelGoalApi(normalizedGoalId, { signal: controller.signal });
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    onSuccess: async (_, goalId) => {
      await invalidateGoalDomainQueries(queryClient, {
        goalId,
        includeTransactionEffects: true,
      });
    },
    retry: 0,
  });

  useEffect(() => () => abortControllerRef.current?.abort(), []);

  return {
    ...mutation,
    cancel: () => abortControllerRef.current?.abort(),
  };
}
