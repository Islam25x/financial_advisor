import { requestJson } from "../../../infrastructure/api/http";
export { refreshAccessToken } from "../../../infrastructure/api/auth-refresh";
import { getAppApiBaseUrl } from "../../../infrastructure/api/api-config";
import type { LoginRequestDto, RegisterRequestDto, LogoutResponseDto } from "./auth.dto";

export const REGISTER_SUCCESS_MESSAGE =
  "Registration successful. Please check your email to confirm your account.";

export async function registerApi(
  payload: RegisterRequestDto,
  options?: { signal?: AbortSignal },
): Promise<unknown> {
  return requestJson<unknown>("/api/Auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
  });
}

export async function loginApi(
  payload: LoginRequestDto,
  options?: { signal?: AbortSignal },
): Promise<unknown> {
  return requestJson<unknown>("/api/Auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
  });
}

export async function logoutApi(
  options?: { signal?: AbortSignal },
): Promise<LogoutResponseDto> {
  return requestJson<LogoutResponseDto>(
    "/api/Auth/logout",
    {
      method: "POST",
      signal: options?.signal,
      baseUrl: getAppApiBaseUrl(),
      withAuth: true,
      skipAuthRefresh: true,
    }
  );
}
