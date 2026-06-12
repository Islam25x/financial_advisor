import { useEffect, useRef } from "react";
import {
    useMutation,
    type UseMutationResult,
} from "@tanstack/react-query";

import { ApiError } from "../../../infrastructure/api/api-error";

import { resetPasswordApi } from "../api/reset-password.api";

import type {
    ResetPasswordRequestDto,
    ResetPasswordResponseDto,
} from "../api/auth.dto";

type ResetPasswordMutation = UseMutationResult<
    ResetPasswordResponseDto,
    ApiError,
    ResetPasswordRequestDto
>;

type UseResetPasswordResult = ResetPasswordMutation & {
    cancel: () => void;
};

export function useResetPassword(): UseResetPasswordResult {
    const abortControllerRef = useRef<AbortController | null>(null);

    const mutation = useMutation<
        ResetPasswordResponseDto,
        ApiError,
        ResetPasswordRequestDto
    >({
        mutationKey: ["auth", "reset-password"],

        mutationFn: async (payload) => {
            abortControllerRef.current?.abort();

            const controller = new AbortController();
            abortControllerRef.current = controller;

            try {
                return await resetPasswordApi(
                    {
                        email: payload.email.trim(),
                        token: payload.token,
                        newPassword: payload.newPassword,
                        confirmPassword: payload.confirmPassword,
                    },
                    { signal: controller.signal },
                );
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