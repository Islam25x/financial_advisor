import { requestJson } from "../../../infrastructure/api/http";
import { getAppApiBaseUrl } from "../../../infrastructure/api/api-config";
import type { ResendConfirmationRequestDto } from "./auth.dto";

export async function resendConfirmationApi(
  payload: ResendConfirmationRequestDto,
  options?: { signal?: AbortSignal },
): Promise<unknown> {
  const query = new URLSearchParams({
    email: payload.email,
  });

  return requestJson<unknown>(`/api/Auth/resend-confirmation-link?${query.toString()}`, {
    method: "POST",
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
  });
}
