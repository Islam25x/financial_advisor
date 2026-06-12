import { getAppApiBaseUrl } from "../../../infrastructure/api/api-config";
import { requestJson } from "../../../infrastructure/api/http";
import type { CreateGoalInput } from "../types/goal.types";

export async function createGoalApi(
  payload: CreateGoalInput,
  options?: { signal?: AbortSignal },
): Promise<void> {
  await requestJson<unknown>("/api/Goal/create-goal", {
    method: "POST",
    body: JSON.stringify(payload),
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
    withAuth: true,
  });
}
