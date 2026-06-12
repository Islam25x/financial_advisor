import {
  ReceiptOcrResponseSchema,
  type ReceiptOcrResponse,
} from "../api/ai.dto";
import { normalizeTransactionCreationTimestamp } from "../../transactions/utils/transaction-dates";
export {
  parseCreateTransactionsFromSpeechRequest,
  parseCreateTransactionsFromSpeechResponse,
  parseParsedTransaction,
  parseTransactionDraft,
} from "./speech.parser";
export { parseVoiceToTextResponse } from "./voice.parser";

export function parseReceiptOcrResponse(payload: unknown): ReceiptOcrResponse {
  const parsed = ReceiptOcrResponseSchema.parse(payload);

  return {
    ...parsed,
    issued_at: normalizeTransactionCreationTimestamp(parsed.issued_at),
  };
}
