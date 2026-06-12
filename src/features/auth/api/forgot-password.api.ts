import { requestJson } from "../../../infrastructure/api/http";
import { getAppApiBaseUrl } from "../../../infrastructure/api/api-config";
import type {
  ForgotPasswordRequestDto,
  ForgotPasswordResponseDto,
} from "./auth.dto";

export async function forgotPasswordApi(
  payload: ForgotPasswordRequestDto,
  options?: { signal?: AbortSignal },
): Promise<ForgotPasswordResponseDto> {
  return requestJson<ForgotPasswordResponseDto>("/api/Auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
  });
}
