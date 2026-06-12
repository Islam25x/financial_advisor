import { useEffect, useRef } from "react";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { invalidateSavingPlanActiveStateQueries } from "../../../infrastructure/query/invalidation/saving-plan-invalidation";
import { deactivateSavingPlanApi } from "../api/deactivate-saving-plan.api";

type DeactivateSavingPlanMutation = UseMutationResult<void, ApiError, string>;

type UseDeactivateSavingPlanResult = DeactivateSavingPlanMutation & {
  cancel: () => void;
};

export function useDeactivateSavingPlan(): UseDeactivateSavingPlanResult {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation<void, ApiError, string>({
    mutationKey: ["saving-plans", "deactivate"],
    mutationFn: async (savingPlanId) => {
      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        await deactivateSavingPlanApi(savingPlanId, {
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
