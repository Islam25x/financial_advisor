import type { TransactionRowData } from "../utils/transaction.selectors";
import { formatTransactionDate } from "../utils/transaction.formatters";
import AmountText from "./AmountText";
import CategoryBadge from "./CategoryBadge";
import { Button, Text } from "../../../shared/ui";
import type { Transaction } from "../types/transaction.types";

type TransactionRowProps = {
  transaction: TransactionRowData;
  onOpenDetails: (transaction: Transaction) => void;
};

function TransactionRow({ transaction, onOpenDetails }: TransactionRowProps) {
  return (
    <tr className="border-t cursor-pointer transition hover:bg-slate-50">
      <td className="py-3 text-sm text-gray-700">
        <Text as="span" variant="body" className="text-gray-700">
          {formatTransactionDate(transaction.date)}
        </Text>
      </td>
      <td className="py-3 text-sm">
        <AmountText amount={transaction.amount} type={transaction.type} />
      </td>
      <td className="py-3 text-sm font-semibold text-gray-800">
        <Text as="span" variant="body" weight="bold" className="text-gray-800">
          {transaction.displayTitle}
        </Text>
      </td>
      <td className="py-3 text-sm text-gray-600">
        <Text as="span" variant="body" className="text-gray-600">
          {transaction.merchant || "N/A"}
        </Text>
      </td>
      <td className="py-3 text-sm">
        <CategoryBadge
          category={transaction.category}
          label={transaction.rawCategory ?? transaction.category}
        />
      </td>
      <td className="py-3 text-sm">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="rounded-full px-3 py-1 text-xs"
          onClick={() => onOpenDetails(transaction.transaction)}
        >
          Details
        </Button>
      </td>
    </tr>
  );
}

export default TransactionRow;
