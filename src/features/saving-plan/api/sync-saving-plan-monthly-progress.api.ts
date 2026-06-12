import { getAppApiBaseUrl } from "../../../infrastructure/api/api-config";
import { requestJson } from "../../../infrastructure/api/http";

export async function syncSavingPlanMonthlyProgressApi(
  options?: { signal?: AbortSignal },
): Promise<void> {
  await requestJson<unknown>("/api/saving-plans/active/monthly-progress/sync", {
    method: "POST",
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
    withAuth: true,
  });
}
