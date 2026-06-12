import { useEffect, useRef } from "react";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { invalidateSavingPlanProgressQueries } from "../../../infrastructure/query/invalidation/saving-plan-invalidation";
import { syncSavingPlanMonthlyProgressApi } from "../api/sync-saving-plan-monthly-progress.api";

type SyncSavingPlanMonthlyProgressMutation = UseMutationResult<void, ApiError, void>;

type UseSyncSavingPlanMonthlyProgressResult = SyncSavingPlanMonthlyProgressMutation & {
  cancel: () => void;
};

export function useSyncSavingPlanMonthlyProgress(): UseSyncSavingPlanMonthlyProgressResult {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation<void, ApiError, void>({
    mutationKey: ["saving-plans", "monthly-progress", "sync"],
    mutationFn: async () => {
      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        await syncSavingPlanMonthlyProgressApi({
          signal: controller.signal,
        });
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    onSuccess: async () => {
      await invalidateSavingPlanProgressQueries(queryClient);
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
