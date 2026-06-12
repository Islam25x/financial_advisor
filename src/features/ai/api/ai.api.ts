import { getAppApiBaseUrl } from "../../../infrastructure/api/api-config";
import { requestJson } from "../../../infrastructure/api/http";
import type { ParsedTransaction } from "../../transactions/utils/parsed-transaction.schema";
import { getCurrentTransactionTimestamp } from "../../transactions/utils/transaction-dates";
import { parseTransactionDraft } from "../utils/speech.parser";
export { createTransactionsFromSpeechApi } from "./parseTransactionFromSpeechApi";
export { voiceToTextApi } from "./voiceToTextApi";

export async function parseTransactionApi(
  message: string,
  options?: { signal?: AbortSignal },
): Promise<ParsedTransaction> {
  const response = await requestJson<unknown>("/api/AI/parse-transaction", {
    method: "POST",
    body: JSON.stringify({
      text: message,
      occurredAt: getCurrentTransactionTimestamp(),
    }),
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
    withAuth: true,
  });

  return parseTransactionDraft(response);
}