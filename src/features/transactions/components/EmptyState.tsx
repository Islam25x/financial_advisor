import { Text } from "../../../shared/ui";


function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <Text variant="body" weight="bold" className="text-gray-900">
        No transactions yet
      </Text>
      <Text variant="body" className="text-gray-500">
        Start adding transactions to track your finances
      </Text>
    </div>
  );
}

export default EmptyState;
