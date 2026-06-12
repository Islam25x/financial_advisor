import { useEffect, useRef } from "react";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { createCategoryApi } from "../api/create-category.api";
import { TransactionType } from "../types/transaction.enums";
import type { TransactionCategory } from "../types/category.types";
import { parseCreatedCategory } from "../utils/category.parser";
import { BILL_CATEGORIES_QUERY_KEY } from "./useBillCategories";

type CreateBillCategoryInput = {
  name: string;
};

type CreateBillCategoryMutation = UseMutationResult<
  TransactionCategory | null,
  ApiError,
  CreateBillCategoryInput
>;

type UseCreateBillCategoryResult = CreateBillCategoryMutation & {
  cancel: () => void;
};

export function useCreateBillCategory(): UseCreateBillCategoryResult {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation<TransactionCategory | null, ApiError, CreateBillCategoryInput>({
    mutationKey: ["categories", "bill", "create"],
    mutationFn: async (payload) => {
      const name = payload.name.trim();

      if (!name) {
        throw new ApiError("Category name is required.", 400, "INVALID_RESPONSE");
      }

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await createCategoryApi(
          {
            name,
            categoryType: TransactionType.Expense,
            isBillCategory: true,
          },
          { signal: controller.signal },
        );

        const createdCategory = parseCreatedCategory(response, TransactionType.Expense);

        return createdCategory
          ? { ...createdCategory, isBillCategory: true }
          : null;
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: BILL_CATEGORIES_QUERY_KEY,
      });
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
