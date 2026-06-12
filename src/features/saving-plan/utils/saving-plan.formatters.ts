import { parseBackendTimestamp } from "../../../shared/utils/date-time";

export function formatSavingPlanCurrency(value?: number): string {
  if (value === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatSavingPlanPercentage(value?: number): string {
  if (value === undefined) {
    return "-";
  }

  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
  }).format(value)}%`;
}

export function formatSavingPlanCurrencyDifference(value?: number): string {
  if (value === undefined) {
    return "-";
  }

  const formatted = formatSavingPlanCurrency(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

export function formatSavingPlanAmount(value?: number): string {
  if (value === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatSavingPlanDate(value?: string | null): string {
  if (!value) {
    return "-";
  }

  const parsedDate = parseBackendTimestamp(value);

  if (!parsedDate) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

export function formatSavingPlanDuration(months?: number): string {
  if (months === undefined) {
    return "-";
  }

  return `${months} ${months === 1 ? "month" : "months"}`;
}

export function formatRecommendationAmount(value: number): string {
  return `Save ${formatSavingPlanCurrency(value)} / month`;
}
