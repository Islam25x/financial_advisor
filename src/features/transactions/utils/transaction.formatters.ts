import { formatTransactionTimestampForDisplay } from "./transaction-dates";

export const currencyFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

export function formatTransactionDate(
  value?: string | null,
  options?: Intl.DateTimeFormatOptions,
) {
  return formatTransactionTimestampForDisplay(value, options);
}
