import { useEffect, useRef } from "react";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { createCategoryApi } from "../api/create-category.api";
import type {
  CreateTransactionCategoryInput,
  TransactionCategory,
} from "../types/category.types";
import { parseCreatedCategory } from "../utils/category.parser";
import { ApiError } from "../../../infrastructure/api/api-error";
import { TRANSACTION_CATEGORIES_QUERY_KEY } from "./useCategories";

type CreateCategoryMutation = UseMutationResult<
  TransactionCategory | null,
  ApiError,
  CreateTransactionCategoryInput
>;

type UseCreateCategoryResult = CreateCategoryMutation & {
  cancel: () => void;
};

export function useCreateCategory(): UseCreateCategoryResult {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation<
    TransactionCategory | null,
    ApiError,
    CreateTransactionCategoryInput
  >({
    mutationKey: ["transactions", "categories", "create"],
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
            categoryType: payload.categoryType,
          },
          { signal: controller.signal },
        );

        return parseCreatedCategory(response, payload.categoryType);
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    onSuccess: (createdCategory) => {
      if (createdCategory) {
        queryClient.setQueryData<TransactionCategory[]>(
          TRANSACTION_CATEGORIES_QUERY_KEY,
          (currentCategories = []) => {
            const alreadyExists = currentCategories.some(
              (category) => category.id === createdCategory.id,
            );

            if (alreadyExists) {
              return currentCategories;
            }

            return [...currentCategories, createdCategory];
          },
        );
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
