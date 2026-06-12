import { getAppApiBaseUrl } from "../../../infrastructure/api/api-config";
import { requestJson } from "../../../infrastructure/api/http";

export async function applySavingPlanApi(
  savingPlanId: string,
  options?: { signal?: AbortSignal },
): Promise<void> {
  await requestJson<unknown>(`/api/saving-plans/${savingPlanId}/apply`, {
    method: "POST",
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
    withAuth: true,
  });
}
