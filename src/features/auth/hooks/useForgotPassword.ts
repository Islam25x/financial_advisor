import { useEffect, useRef } from "react";
import {
    useMutation,
    type UseMutationResult,
} from "@tanstack/react-query";

import { ApiError } from "../../../infrastructure/api/api-error";

import { forgotPasswordApi } from "../api/forgot-password.api";

import type {
    ForgotPasswordRequestDto,
    ForgotPasswordResponseDto,
} from "../api/auth.dto";

type ForgotPasswordMutation = UseMutationResult<
    ForgotPasswordResponseDto,
    ApiError,
    ForgotPasswordRequestDto
>;

type UseForgotPasswordResult = ForgotPasswordMutation & {
    cancel: () => void;
};

export function useForgotPassword(): UseForgotPasswordResult {
    const abortControllerRef = useRef<AbortController | null>(null);

    const mutation = useMutation<
        ForgotPasswordResponseDto,
        ApiError,
        ForgotPasswordRequestDto
    >({
        mutationKey: ["auth", "forgot-password"],

        mutationFn: async (payload) => {
            abortControllerRef.current?.abort();

            const controller = new AbortController();
            abortControllerRef.current = controller;

            try {
                return await forgotPasswordApi(
                    {
                        email: payload.email.trim(),
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