import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../../../infrastructure/api/api-error";
import { queryKeys } from "../../../infrastructure/query/query-keys";
import { confirmEmailApi } from "../api/confirm-email.api";
import type { ConfirmEmailRequestDto } from "../api/auth.dto";

export function useConfirmEmail(payload: ConfirmEmailRequestDto | null) {
  return useQuery<unknown, ApiError>({
    queryKey: queryKeys.auth.confirmEmail(
      payload?.userId ?? "",
      payload?.token ?? "",
    ),
    queryFn: ({ signal }) => {
      if (!payload) {
        throw new ApiError("Invalid or expired link.", 400, "HTTP");
      }

      return confirmEmailApi(payload, { signal });
    },
    enabled: Boolean(payload?.userId && payload?.token),
    retry: false,
    staleTime: Infinity,
  });
}
