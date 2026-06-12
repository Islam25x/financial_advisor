import { requestJson } from "../../../infrastructure/api/http";
import { getAppApiBaseUrl } from "../../../infrastructure/api/api-config";
import type { ConfirmEmailRequestDto } from "./auth.dto";

export async function confirmEmailApi(
  payload: ConfirmEmailRequestDto,
  options?: { signal?: AbortSignal },
): Promise<unknown> {
  const query = new URLSearchParams({
    userId: payload.userId,
    token: payload.token,
  });

  return requestJson<unknown>(`/api/Auth/confirm-email?${query.toString()}`, {
    method: "GET",
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
  });
}
