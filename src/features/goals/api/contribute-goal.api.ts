import { getAppApiBaseUrl } from "../../../infrastructure/api/api-config";
import { requestJson } from "../../../infrastructure/api/http";

export async function contributeGoalApi(
  goalId: string,
  payload: { amount: number },
  options?: { signal?: AbortSignal },
): Promise<void> {
  await requestJson<unknown>(`/api/Goal/${encodeURIComponent(goalId)}/contribute`, {
    method: "POST",
    body: JSON.stringify(payload),
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
    withAuth: true,
  });
}
