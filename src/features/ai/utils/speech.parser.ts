import {
  CreateTransactionsFromSpeechResponseSchema,
  ParseTransactionsFromSpeechRequestSchema,
  type CreateTransactionsFromSpeechResponseDto,
  type ParseTransactionsFromSpeechRequestDto,
} from "../api/speech.dto";
import {
  parseParsedTransaction as parseTransactionDraftPayload,
  type ParsedTransaction,
} from "../../transactions/utils/parsed-transaction.schema";
import { normalizeTransactionCreationTimestamp } from "../../transactions/utils/transaction-dates";

export function parseTransactionDraft(payload: unknown): ParsedTransaction {
  const parsed = parseTransactionDraftPayload(payload);

  return {
    ...parsed,
    date: normalizeTransactionCreationTimestamp(parsed.date),
  };
}

export function parseParsedTransaction(payload: unknown): ParsedTransaction {
  return parseTransactionDraft(payload);
}

export function parseCreateTransactionsFromSpeechRequest(
  payload: unknown,
): ParseTransactionsFromSpeechRequestDto {
  return ParseTransactionsFromSpeechRequestSchema.parse(payload);
}

export function parseCreateTransactionsFromSpeechResponse(
  payload: unknown,
): CreateTransactionsFromSpeechResponseDto {
  return CreateTransactionsFromSpeechResponseSchema.parse(payload);
}
