import { getAppApiBaseUrl } from "../../../infrastructure/api/api-config";
import { requestJson } from "../../../infrastructure/api/http";

export async function getCategoriesApi(
  options?: { signal?: AbortSignal },
): Promise<unknown> {
  return requestJson<unknown>("/api/Category/get-categories", {
    method: "GET",
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
    withAuth: true,
  });
}

export async function getBillCategoriesApi(
  options?: { signal?: AbortSignal },
): Promise<unknown> {
  return requestJson<unknown>("/api/Category/bill-categories", {
    method: "GET",
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
    withAuth: true,
  });
}
