import {
  formatBackendTimestampForDateTimeInput,
  formatBackendTimestampForDisplay,
  formatDateForDateTimeLocal,
  formatNowForDateTimeLocal,
  getCairoMonthKey,
  hasExplicitTimezone,
  isDateOnlyValue,
  normalizeLocalDateTimeInputToUtcTimestamp,
  parseBackendTimestamp,
  parseLocalDateTimeInput,
} from "../../../shared/utils/date-time";

export function parseTransactionDate(value?: string | null): Date | null {
  return parseBackendTimestamp(value);
}

export function normalizeTransactionTimestamp(value?: string | null): string | null {
  const parsedDate = parseTransactionDate(value);

  if (!parsedDate) {
    return null;
  }

  return parsedDate.toISOString();
}

export function normalizeTransactionLocalInputTimestamp(
  value?: string | null,
): string | null {
  return normalizeLocalDateTimeInputToUtcTimestamp(value);
}

export function getCurrentTransactionTimestamp(): string {
  return normalizeLocalDateTimeInputToUtcTimestamp(formatNowForDateTimeLocal())!;
}

export function normalizeTransactionCreationTimestamp(
  value?: string | null,
): string {
  const normalizedValue = typeof value === "string" ? value.trim() : "";

  if (!normalizedValue) {
    return getCurrentTransactionTimestamp();
  }

  if (isDateOnlyValue(normalizedValue)) {
    const currentLocalValue = formatNowForDateTimeLocal();
    const currentLocalTime = currentLocalValue.slice(11);

    return normalizeLocalDateTimeInputToUtcTimestamp(
      `${normalizedValue}T${currentLocalTime}`,
    )!;
  }

  if (hasExplicitTimezone(normalizedValue)) {
    const backendTimestamp = normalizeTransactionTimestamp(normalizedValue);

    if (backendTimestamp) {
      return backendTimestamp;
    }

    return getCurrentTransactionTimestamp();
  }

  const localTimestamp = normalizeLocalDateTimeInputToUtcTimestamp(normalizedValue);

  if (localTimestamp) {
    return localTimestamp;
  }

  const backendTimestamp = normalizeTransactionTimestamp(normalizedValue);

  if (backendTimestamp) {
    return backendTimestamp;
  }

  return getCurrentTransactionTimestamp();
}

export function parseTransactionDateTimeLocalInput(value?: string | null): Date | null {
  return parseLocalDateTimeInput(value);
}

export function parseDateTimeLocalValue(value: string): string {
  return formatBackendTimestampForDateTimeInput(value);
}

export { formatDateForDateTimeLocal, formatNowForDateTimeLocal };

export function formatTransactionTimestampForDisplay(
  value?: string | null,
  options?: Intl.DateTimeFormatOptions,
): string {
  return formatBackendTimestampForDisplay(value, options);
}

export function toTransactionMonthKey(value?: string): string {
  return getCairoMonthKey(value);
}
