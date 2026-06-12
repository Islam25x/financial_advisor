import { Button, Text } from "../../../shared/ui";

type TransactionSectionHeaderProps = {
  count: number;
  onAddTransaction?: () => void;
};

function TransactionSectionHeader({
  count,
  onAddTransaction,
}: TransactionSectionHeaderProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Text as="h2" variant="subtitle" weight="bold">
          Transactions
        </Text>
        <Text
          as="span"
          variant="caption"
          weight="bold"
          className="rounded-full bg-primary/10 px-2.5 py-1 text-primary-700"
        >
          {count} transactions
        </Text>
      </div>
      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={onAddTransaction}
        className="flex items-center gap-2 rounded-full px-4 py-2 text-xs shadow-sm"
      >
        <span className="text-base leading-none">+</span>
        Add Transaction
      </Button>
    </div>
  );
}

export default TransactionSectionHeader;
