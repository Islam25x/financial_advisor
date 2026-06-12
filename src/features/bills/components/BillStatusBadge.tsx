import { cn } from "../../../shared/ui";
import { BILL_STATUS_STYLES, getStatusLabel } from "../utils/bill.formatters";

type BillStatusBadgeProps = {
  status: string;
};

function BillStatusBadge({ status }: BillStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2.5 py-1 text-xs font-semibold",
        BILL_STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600",
      )}
    >
      {getStatusLabel(status)}
    </span>
  );
}

export default BillStatusBadge;
