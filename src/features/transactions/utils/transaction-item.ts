import type { Transaction } from "../types/transaction.types";

export function normalizeOptionalTransactionItem(
  value: string | null | undefined,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue ? normalizedValue : null;
}

export function getTransactionDisplayTitle(transaction: Pick<Transaction, "item">): string {
  return normalizeOptionalTransactionItem(transaction.item) ?? "Untitled";
}
