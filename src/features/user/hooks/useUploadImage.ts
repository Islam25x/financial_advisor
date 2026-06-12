import { useEffect, useRef } from "react";
import {
    useMutation,
    useQueryClient,
    type UseMutationResult,
} from "@tanstack/react-query";
import { uploadImage } from "../api/user.api";
import { ApiError } from "../../../infrastructure/api/api-error";
import { USER_PROFILE_QUERY_KEY } from "./useUserProfile";

type UploadImageMutation = UseMutationResult<
    void,
    ApiError,
    File
>;

type UseUploadImageResult = UploadImageMutation & {
    cancel: () => void;
};

export function useUploadImage(): UseUploadImageResult {
    const queryClient = useQueryClient();
    const abortControllerRef = useRef<AbortController | null>(null);

    const mutation = useMutation<void, ApiError, File>({
        mutationKey: ["user", "profile", "upload-image"],

        mutationFn: async (file) => {
            abortControllerRef.current?.abort();

            const controller = new AbortController();
            abortControllerRef.current = controller;

            try {
                await uploadImage(file, {
                    signal: controller.signal,
                });
            } finally {
                if (abortControllerRef.current === controller) {
                    abortControllerRef.current = null;
                }
            }
        },

        onSuccess: async () => {
            await queryClient.refetchQueries({
                queryKey: USER_PROFILE_QUERY_KEY,
                type: "active",
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
