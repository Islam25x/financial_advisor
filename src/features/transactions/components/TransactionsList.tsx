import type { Transaction } from "../types/transaction.types";
import type { TransactionRowData } from "../utils/transaction.selectors";
import TransactionRow from "./TransactionRow";

type TransactionsListProps = {
  rows: TransactionRowData[];
  onOpenDetails: (transaction: Transaction) => void;
};

function TransactionsList({ rows, onOpenDetails }: TransactionsListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-gray-500">
            <th className="py-2">DATE</th>
            <th className="py-2">AMOUNT</th>
            <th className="py-2">ITEM</th>
            <th className="py-2">MERCHANT</th>
            <th className="py-2">CATEGORY</th>
            <th className="py-2">DETAILS</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              transaction={transaction}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionsList;
