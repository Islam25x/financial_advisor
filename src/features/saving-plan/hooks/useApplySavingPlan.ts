import { useEffect, useRef } from "react";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { invalidateSavingPlanActiveStateQueries } from "../../../infrastructure/query/invalidation/saving-plan-invalidation";
import { applySavingPlanApi } from "../api/apply-saving-plan.api";
import type { SavingPlanResponseDto } from "../api/saving-plan.dto";

type ApplySavingPlanMutation = UseMutationResult<void, ApiError, SavingPlanResponseDto>;

type UseApplySavingPlanResult = ApplySavingPlanMutation & {
  cancel: () => void;
};

export function useApplySavingPlan(): UseApplySavingPlanResult {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation<void, ApiError, SavingPlanResponseDto>({
    mutationKey: ["saving-plans", "apply"],
    mutationFn: async (plan) => {
      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        await applySavingPlanApi(plan.Id, {
          signal: controller.signal,
        });
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    onSuccess: async () => {
      await invalidateSavingPlanActiveStateQueries(queryClient);
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
