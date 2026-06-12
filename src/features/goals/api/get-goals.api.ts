import { getAppApiBaseUrl } from "../../../infrastructure/api/api-config";
import { requestJson } from "../../../infrastructure/api/http";

const GOALS_PAGE_SIZE = 2;

export async function getGoalsApi(
  pageNumber: number,
  options?: { signal?: AbortSignal },
): Promise<unknown> {
  const params = new URLSearchParams({
    PageNumber: String(pageNumber),
    PageSize: String(GOALS_PAGE_SIZE),
  });

  return requestJson<unknown>(`/api/Goal/get-goals?${params.toString()}`, {
    method: "GET",
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
    withAuth: true,
  });
}
