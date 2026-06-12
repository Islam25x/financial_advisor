import { ApiError } from "../../../infrastructure/api/api-error";
import { getAppApiBaseUrl } from "../../../infrastructure/api/api-config";
import { requestJson } from "../../../infrastructure/api/http";

export async function getActiveSavingPlanApi(
  options?: { signal?: AbortSignal },
): Promise<unknown | null> {
  try {
    return await requestJson<unknown>("/api/saving-plans/active", {
      method: "GET",
      signal: options?.signal,
      baseUrl: getAppApiBaseUrl(),
      withAuth: true,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}
