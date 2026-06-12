import type { AddTransactionType } from "../types/add-transaction.types";
import type { TransactionCategory } from "../types/category.types";

export function selectCategoriesByType(
  categories: TransactionCategory[],
  type: AddTransactionType,
): TransactionCategory[] {
  return categories.filter((category) => category.categoryType === type);
}

export function findCategoryByName(
  categories: TransactionCategory[],
  name: string,
  type: AddTransactionType,
): TransactionCategory | null {
  const normalizedName = name.trim().toLowerCase();

  if (!normalizedName) {
    return null;
  }

  return (
    categories.find(
      (category) =>
        category.categoryType === type &&
        category.name.trim().toLowerCase() === normalizedName,
    ) ?? null
  );
}
