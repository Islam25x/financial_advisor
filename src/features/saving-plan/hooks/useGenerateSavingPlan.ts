import { useEffect, useRef } from "react";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { generateSavingPlanApi } from "../api/generate-saving-plan.api";
import type { SavingPlanResponseDto } from "../api/saving-plan.dto";
import type { SavingPlanFormInput } from "../types/saving-plan.types";
import { parseGenerateSavingPlanPayload } from "../utils/saving-plan.parser";

type GenerateSavingPlanMutation = UseMutationResult<
  SavingPlanResponseDto,
  ApiError,
  SavingPlanFormInput
>;

type UseGenerateSavingPlanResult = GenerateSavingPlanMutation & {
  cancel: () => void;
};

export function useGenerateSavingPlan(): UseGenerateSavingPlanResult {
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation<SavingPlanResponseDto, ApiError, SavingPlanFormInput>({
    mutationKey: ["saving-plans", "generate"],
    mutationFn: async (payload) => {
      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        return await generateSavingPlanApi(parseGenerateSavingPlanPayload(payload), {
          signal: controller.signal,
        });
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
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
