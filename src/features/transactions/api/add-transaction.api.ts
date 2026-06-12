import { getAppApiBaseUrl } from "../../../infrastructure/api/api-config";
import { requestJson } from "../../../infrastructure/api/http";
import type { AddTransactionPayload } from "../types/add-transaction.types";

export async function addTransactionApi(
  payload: AddTransactionPayload,
  options?: { signal?: AbortSignal },
): Promise<void> {
  await requestJson<unknown>("/api/Transaction/add-transaction", {
    method: "POST",
    body: JSON.stringify(payload),
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
    withAuth: true,
  });
}
