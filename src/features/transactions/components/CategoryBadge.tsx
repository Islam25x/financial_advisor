import { TransactionCategory } from "../types/transaction.enums";
import { Text } from "../../../shared/ui";

type CategoryBadgeProps = {
  category: TransactionCategory;
  label?: string;
};

const CATEGORY_STYLES: Record<TransactionCategory, string> = {
  [TransactionCategory.Income]: "bg-primary/10 text-primary-700",
  [TransactionCategory.Salary]: "bg-primary/10 text-primary-700",
  [TransactionCategory.Food]: "bg-primary/10 text-primary-700",
  [TransactionCategory.Transport]: "bg-primary/10 text-primary-700",
  [TransactionCategory.Shopping]: "bg-primary/10 text-primary-700",
  [TransactionCategory.Utilities]: "bg-primary/10 text-primary-700",
  [TransactionCategory.Entertainment]: "bg-primary/10 text-primary-700",
  [TransactionCategory.Health]: "bg-primary/10 text-primary-700",
  [TransactionCategory.Transfer]: "bg-primary/10 text-primary-700",
  [TransactionCategory.Other]: "bg-gray-100 text-gray-700",
};

function CategoryBadge({ category, label }: CategoryBadgeProps) {
  return (
    <Text
      as="span"
      variant="caption"
      weight="bold"
      className={`inline-flex items-center rounded-full px-3 py-1 ${CATEGORY_STYLES[category]}`}
    >
      {label ?? category}
    </Text>
  );
}

export default CategoryBadge;
