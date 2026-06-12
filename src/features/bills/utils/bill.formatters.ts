import type { BillStatus } from "../types/bill.types";

export const BILL_STATUS_STYLES: Record<string, string> = {
  DueToday: "bg-orange-50 text-orange-600",
  DueSoon: "bg-orange-50 text-orange-600",
  Upcoming: "bg-blue-50 text-blue-600",
  Paid: "bg-emerald-50 text-emerald-600",
  Overdue: "bg-rose-50 text-rose-600",
};

export const BILL_STATUS_DOT_STYLES: Record<string, string> = {
  DueToday: "bg-orange-500",
  DueSoon: "bg-orange-500",
  Upcoming: "bg-blue-500",
  Paid: "bg-emerald-500",
  Overdue: "bg-rose-500",
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatBillDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "-";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function getStatusLabel(status: string): string {
  const labels: Record<BillStatus, string> = {
    DueToday: "Due Today",
    DueSoon: "Due Soon",
    Upcoming: "Upcoming",
    Paid: "Paid",
    Overdue: "Overdue",
  };

  return labels[status as BillStatus] ?? status;
}

export function getDateKey(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
