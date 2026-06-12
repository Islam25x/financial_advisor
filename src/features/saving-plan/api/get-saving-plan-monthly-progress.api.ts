import { getAppApiBaseUrl } from "../../../infrastructure/api/api-config";
import { requestJson } from "../../../infrastructure/api/http";

export async function getSavingPlanMonthlyProgressApi(
  options?: { signal?: AbortSignal },
): Promise<unknown> {
  return requestJson<unknown>("/api/saving-plans/active/monthly-progress", {
    method: "GET",
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
    withAuth: true,
  });
}

export const getActiveSavingPlanMonthlyProgressApi = getSavingPlanMonthlyProgressApi;
