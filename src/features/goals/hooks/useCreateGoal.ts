import { useEffect, useRef } from "react";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { createGoalApi } from "../api/create-goal.api";
import {
  CreateGoalInputSchema,
  type CreateGoalFormInput,
  type CreateGoalInput,
} from "../types/goal.types";
import { ApiError } from "../../../infrastructure/api/api-error";
import { invalidateGoalDomainQueries } from "../../../infrastructure/query/invalidation/goal-invalidation";

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

function mapInputToPayload(input: CreateGoalFormInput): CreateGoalInput {
  const title = input.title.trim();
  const description = input.description.trim();

  const base = {
    title,
    description,
    targetAmount: roundToTwoDecimals(input.targetAmount),
    durationUnit: "Months" as const,
  };

  if (input.durationValue !== undefined) {
    return CreateGoalInputSchema.parse({
      ...base,
      durationValue: roundToTwoDecimals(input.durationValue),
      monthlyAmount: undefined,
    });
  }

  if (input.monthlyAmount !== undefined) {
    return CreateGoalInputSchema.parse({
      ...base,
      durationValue: undefined,
      monthlyAmount: roundToTwoDecimals(input.monthlyAmount),
    });
  }

  throw new ApiError("Invalid goal input", 400, "INVALID_RESPONSE");
}

type CreateGoalMutation = UseMutationResult<void, ApiError, CreateGoalFormInput>;

type UseCreateGoalResult = CreateGoalMutation & {
  cancel: () => void;
};

export function useCreateGoal(): UseCreateGoalResult {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation<void, ApiError, CreateGoalFormInput>({
    mutationKey: ["goals", "create"],
    mutationFn: async (payload) => {
      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        await createGoalApi(mapInputToPayload(payload), {
          signal: controller.signal,
        });
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    onSuccess: async () => {
      await invalidateGoalDomainQueries(queryClient);
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
