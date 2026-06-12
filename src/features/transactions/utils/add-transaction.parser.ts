import { ApiError } from "../../../infrastructure/api/api-error";
import type {
  AddTransactionInput,
  AddTransactionPayload,
  AddTransactionType,
  AddTransactionTypeInput,
} from "../types/add-transaction.types";
import { normalizeOptionalTransactionItem } from "./transaction-item";
import { normalizeTransactionLocalInputTimestamp } from "./transaction-dates";

function normalizeOccurredAt(value: string): string {
  const normalizedTimestamp = normalizeTransactionLocalInputTimestamp(value);

  if (!normalizedTimestamp) {
    throw new ApiError("Transaction date is invalid.", 400, "INVALID_RESPONSE");
  }

  return normalizedTimestamp;
}

function normalizeTransactionType(value: AddTransactionTypeInput): AddTransactionType {
  if (value === "Expense" || value === "Income") {
    return value;
  }

  if (value === "expense") {
    return "Expense";
  }

  if (value === "income") {
    return "Income";
  }

  throw new ApiError("Transaction type is invalid.", 400, "INVALID_RESPONSE");
}

export function parseAddTransactionPayload(input: AddTransactionInput): AddTransactionPayload {
  const transactionName = input.transactionName.trim();
  const normalizedNotes = normalizeOptionalTransactionItem(input.notes);
  const merchant = normalizeOptionalTransactionItem(input.merchant);
  const item = normalizeOptionalTransactionItem(input.item);
  const fallbackNotes = transactionName || item || merchant || "Transaction";
  const notes = normalizedNotes ?? fallbackNotes;
  const normalizedType = normalizeTransactionType(input.type);
  const normalizedCategoryType = normalizeTransactionType(input.categoryType);

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new ApiError("Amount must be greater than zero.", 400, "INVALID_RESPONSE");
  }

  if (!input.categoryId.trim()) {
    throw new ApiError("Category is required.", 400, "INVALID_RESPONSE");
  }

  if (normalizedCategoryType !== normalizedType) {
    throw new ApiError(
      "Selected category does not match the transaction type.",
      400,
      "INVALID_RESPONSE",
    );
  }

  return {
    amount: input.amount,
    type: normalizedType,
    categoryId: input.categoryId.trim(),
    notes,
    merchant,
    item,
    occurredAt: normalizeOccurredAt(input.occurredAt),
  };
}
