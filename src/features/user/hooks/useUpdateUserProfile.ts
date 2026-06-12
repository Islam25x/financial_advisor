import { useEffect, useRef } from "react";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { updateUserProfileApi } from "../api/user.api";
import type { UpdateUserProfileRequestDto } from "../api/user.dto";
import { ApiError } from "../../../infrastructure/api/api-error";
import { USER_PROFILE_QUERY_KEY } from "./useUserProfile";

export interface UpdateUserProfileInput {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
}

function mapInputToRequestDto(input: UpdateUserProfileInput): UpdateUserProfileRequestDto {
  return {
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    phoneNumber: input.phoneNumber.trim(),
    dateOfBirth: input.dateOfBirth,
  };
}

type UpdateUserProfileMutation = UseMutationResult<
  void,
  ApiError,
  UpdateUserProfileInput
>;

type UseUpdateUserProfileResult = UpdateUserProfileMutation & {
  cancel: () => void;
};

export function useUpdateUserProfile(): UseUpdateUserProfileResult {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation<void, ApiError, UpdateUserProfileInput>({
    mutationKey: ["user", "profile", "update"],
    mutationFn: async (payload) => {
      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        await updateUserProfileApi(mapInputToRequestDto(payload), {
          signal: controller.signal,
        });
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: USER_PROFILE_QUERY_KEY,
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
