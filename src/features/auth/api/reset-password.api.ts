import type { ResetPasswordRequestDto, ResetPasswordResponseDto } from "./auth.dto";
import { getAppApiBaseUrl } from "../../../infrastructure/api/api-config";
import { requestJson } from "../../../infrastructure/api/http";

export async function resetPasswordApi(
  payload: ResetPasswordRequestDto,
  options?: { signal?: AbortSignal },
): Promise<ResetPasswordResponseDto> {
  return requestJson<ResetPasswordResponseDto>("/api/Auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
  });
}
