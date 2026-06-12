import { getAppApiBaseUrl } from "../../../infrastructure/api/api-config";
import { requestJson } from "../../../infrastructure/api/http";

export async function getSavingPlanProgressApi(
  options?: { signal?: AbortSignal },
): Promise<unknown> {
  return requestJson<unknown>("/api/saving-plans/active/progress", {
    method: "GET",
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
    withAuth: true,
  });
}

export const getActiveSavingPlanProgressApi = getSavingPlanProgressApi;
