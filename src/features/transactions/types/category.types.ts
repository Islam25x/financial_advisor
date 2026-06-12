import type { AddTransactionType } from "./add-transaction.types";

export interface TransactionCategory {
  id: string;
  name: string;
  categoryType: AddTransactionType;
  isBillCategory: boolean;
}

export interface CreateTransactionCategoryInput {
  name: string;
  categoryType: AddTransactionType;
  isBillCategory?: boolean;
}
