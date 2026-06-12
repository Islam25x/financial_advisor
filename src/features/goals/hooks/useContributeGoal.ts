import { useEffect, useRef } from "react";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { invalidateGoalDomainQueries } from "../../../infrastructure/query/invalidation/goal-invalidation";
import { contributeGoalApi } from "../api/contribute-goal.api";

type ContributeGoalPayload = {
  goalId: string;
  amount: number;
};

type ContributeGoalMutation = UseMutationResult<void, ApiError, ContributeGoalPayload>;

type UseContributeGoalResult = ContributeGoalMutation & {
  cancel: () => void;
};

export function useContributeGoal(): UseContributeGoalResult {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation<void, ApiError, ContributeGoalPayload>({
    mutationKey: ["goals", "contribute"],
    mutationFn: async ({ goalId, amount }) => {
      const normalizedGoalId = goalId.trim();
      if (!normalizedGoalId) {
        throw new ApiError("Goal id is required.", 400, "INVALID_RESPONSE");
      }

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        await contributeGoalApi(normalizedGoalId, { amount }, { signal: controller.signal });
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    onSuccess: async (_, variables) => {
      await invalidateGoalDomainQueries(queryClient, {
        goalId: variables.goalId,
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
