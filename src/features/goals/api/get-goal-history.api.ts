import { getAppApiBaseUrl } from "../../../infrastructure/api/api-config";
import { requestJson } from "../../../infrastructure/api/http";

const GOAL_HISTORY_PAGE_SIZE = 2;

export async function getGoalHistoryApi(
  goalId: string,
  pageNumber: number,
  options?: { signal?: AbortSignal },
): Promise<unknown> {
  const params = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(GOAL_HISTORY_PAGE_SIZE),
  });

  return requestJson<unknown>(
    `/api/Goal/${encodeURIComponent(goalId)}/history?${params.toString()}`,
    {
      method: "GET",
      signal: options?.signal,
      baseUrl: getAppApiBaseUrl(),
      withAuth: true,
    },
  );
}
