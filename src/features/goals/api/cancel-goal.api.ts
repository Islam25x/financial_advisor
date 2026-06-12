import { getAppApiBaseUrl } from "../../../infrastructure/api/api-config";
import { requestJson } from "../../../infrastructure/api/http";

export async function cancelGoalApi(
  goalId: string,
  options?: { signal?: AbortSignal },
): Promise<void> {
  await requestJson<unknown>(`/api/Goal/${encodeURIComponent(goalId)}/cancel`, {
    method: "POST",
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
    withAuth: true,
  });
}
