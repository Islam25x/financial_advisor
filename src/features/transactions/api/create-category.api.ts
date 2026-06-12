import { getAppApiBaseUrl } from "../../../infrastructure/api/api-config";
import { requestJson } from "../../../infrastructure/api/http";
import type { CreateCategoryRequestDto } from "./category.dto";

export async function createCategoryApi(
  payload: CreateCategoryRequestDto,
  options?: { signal?: AbortSignal },
): Promise<unknown> {
  return requestJson<unknown>("/api/Category/create-category", {
    method: "POST",
    body: JSON.stringify(payload),
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
    withAuth: true,
  });
}
