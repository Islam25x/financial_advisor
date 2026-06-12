import { useEffect, useRef } from "react";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { loginApi } from "../api/auth.api";
import type { LoginRequestDto } from "../api/auth.dto";
import type { AuthSession } from "../types/auth.types";
import { extractLoginData, parseAuthSession } from "../utils/auth.parser";
import { ApiError } from "../../../infrastructure/api/api-error";
import { queryKeys } from "../../../infrastructure/query/query-keys";
import { TRANSACTION_CATEGORIES_QUERY_KEY } from "../../transactions/hooks/useCategories";
import { USER_PROFILE_QUERY_KEY } from "../../user/hooks/useUserProfile";

type LoginMutation = UseMutationResult<AuthSession, ApiError, LoginRequestDto>;

type UseLoginResult = LoginMutation & {
  cancel: () => void;
};

export function useLogin(): UseLoginResult {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation<AuthSession, ApiError, LoginRequestDto>({
    mutationKey: ["auth", "login"],
    mutationFn: async (payload) => {
      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const loginResponse = await loginApi(
          {
            email: payload.email.trim(),
            password: payload.password,
          },
          { signal: controller.signal },
        );

        return parseAuthSession(extractLoginData(loginResponse));
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all }),
        queryClient.invalidateQueries({ queryKey: TRANSACTION_CATEGORIES_QUERY_KEY }),
      ]);
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
