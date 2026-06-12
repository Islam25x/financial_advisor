import { getAppApiBaseUrl } from "../../../infrastructure/api/api-config";
import { requestJson } from "../../../infrastructure/api/http";
import { getCurrentTransactionTimestamp } from "../../transactions/utils/transaction-dates";
import type { CreateTransactionsFromSpeechResponseDto } from "./speech.dto";
import {
  parseCreateTransactionsFromSpeechRequest,
  parseCreateTransactionsFromSpeechResponse,
} from "../utils/speech.parser";

export async function createTransactionsFromSpeechApi(
  text: string,
  options?: { signal?: AbortSignal },
): Promise<CreateTransactionsFromSpeechResponseDto> {
  const payload = parseCreateTransactionsFromSpeechRequest({
    text,
    occurredAt: getCurrentTransactionTimestamp(),
  });
  const response = await requestJson<unknown>("/api/Transaction/from-speech", {
    method: "POST",
    body: JSON.stringify(payload),
    signal: options?.signal,
    baseUrl: getAppApiBaseUrl(),
    withAuth: true,
  });

  return parseCreateTransactionsFromSpeechResponse(response);
}
