import { currencyFormatter } from "../utils/transaction.formatters";
import type { NormalizedTransactionType } from "../utils/transaction.selectors";
import { TransactionType } from "../types/transaction.enums";
import { Text } from "../../../shared/ui";

type AmountTextProps = {
  amount: number;
  type: NormalizedTransactionType;
};

function AmountText({ amount, type }: AmountTextProps) {
  const normalizedAmount = Math.abs(amount);
  const prefix =
    type === TransactionType.Income ? "+" : type === TransactionType.Expense ? "-" : "";
  const colorClass =
    type === TransactionType.Income
      ? "text-emerald-600"
      : type === TransactionType.Expense
        ? "text-rose-600"
        : "text-slate-700";

  return (
    <Text as="span" variant="body" weight="bold" className={colorClass}>
      {prefix}
      {currencyFormatter.format(normalizedAmount)}
    </Text>
  );
}

export default AmountText;
