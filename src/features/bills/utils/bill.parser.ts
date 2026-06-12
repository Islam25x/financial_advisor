import { ApiError } from "../../../infrastructure/api/api-error";
import type {
  Bill,
  BillAmountType,
  BillCalendarOccurrence,
  BillDetails,
  BillFrequency,
  BillNextBill,
  BillOccurrence,
  BillOccurrencesPage,
  BillPayment,
  BillSummary,
} from "../types/bill.types";

type Envelope = {
  items?: unknown;
  data?: unknown;
  result?: unknown;
  payload?: unknown;
  pageNumber?: unknown;
  pageSize?: unknown;
  totalCount?: unknown;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const toNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = toNumber(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toStringValue = (value: unknown, fallback = ""): string =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

const toBoolean = (value: unknown): boolean => value === true;

const toNullableString = (value: unknown): string | null => {
  const parsed = toStringValue(value);
  return parsed || null;
};

function unwrapData(response: unknown): unknown {
  if (!isObject(response)) return response;
  const candidate = response as Envelope;

  if (candidate.data !== undefined) return unwrapData(candidate.data);
  if (candidate.result !== undefined) return unwrapData(candidate.result);
  if (candidate.payload !== undefined) return unwrapData(candidate.payload);

  return response;
}

function extractArray(response: unknown): unknown[] {
  const data = unwrapData(response);

  if (Array.isArray(data)) return data;

  if (isObject(data)) {
    if (Array.isArray((data as Envelope).items))
      return (data as Envelope).items as unknown[];

    const occurrences = (data as { occurrences?: unknown }).occurrences;
    if (Array.isArray(occurrences)) return occurrences;
  }

  return [];
}

function readId(item: Record<string, unknown>): string {
  return (
    toStringValue(item.occurrenceId) ||
    toStringValue(item.billOccurrenceId) ||
    toStringValue(item.id) ||
    toStringValue(item.billId)
  );
}

function readBillSeriesId(item: Record<string, unknown>): string {
  return (
    toStringValue(item.billSeriesId) ||
    toStringValue(item.seriesId) ||
    toStringValue(item.billId)
  );
}

function parseNextBill(value: unknown): BillNextBill | null {
  if (!isObject(value)) return null;

  return {
    occurrenceId: readId(value),
    billSeriesId: readBillSeriesId(value),

    billName: toStringValue(
      value.title,
      toStringValue(value.billName, "Next bill"),
    ),

    amount: toNumber(value.amount),

    dueDate: toStringValue(value.dueDate),

    category: toStringValue(
      value.category,
      toStringValue(value.categoryName, "Uncategorized"),
    ),

    frequency: toStringValue(
      value.frequency,
      toStringValue(value.occurrenceType, "Scheduled"),
    ),

    paymentStatus: toStringValue(
      value.displayStatus,
      toStringValue(value.status, "Upcoming"),
    ),

    amountType:
      toStringValue(value.amountType).toLowerCase() === "variable"
        ? "Variable"
        : toStringValue(value.amountType).toLowerCase() === "fixed"
          ? "Fixed"
          : null,

    canRecordPayment: toBoolean(value.canRecordPayment),
  };
}

export function parseBillSummary(response: unknown): BillSummary {
  const data = unwrapData(response);
  if (!isObject(data)) {
    throw new ApiError("Bills summary response is invalid.", 500, "INVALID_RESPONSE");
  }

  return {
    totalBills: toNumber(data.billsThisMonthCount),

    dueThisWeek: toNumber(data.dueThisWeekCount),

    paidThisMonth: toNumber(data.paidThisMonthCount),

    overdue: toNumber(data.overdueCount),

    nextBill: parseNextBill(data.nextBillDue),
  };
}

export function parseBillCalendar(response: unknown): BillCalendarOccurrence[] {
  return extractArray(response).map((item) => {
    if (!isObject(item)) {
      throw new ApiError("Bills calendar item is invalid.", 500, "INVALID_RESPONSE");
    }

    return {
      occurrenceId: readId(item),

      billName: toStringValue(
        item.title,
        toStringValue(item.billName, "Bill"),
      ),

      dueDate: toStringValue(
        item.dueDate,
        toStringValue(item.date),
      ),

      status: toStringValue(
        item.displayStatus,
        toStringValue(item.status, "Upcoming"),
      ),
    };
  });
}

function parseBillOccurrence(
  item: unknown,
  fallbackAmountType: BillAmountType | null = null,
): BillOccurrence {
  if (!isObject(item)) {
    throw new ApiError("Bill occurrence is invalid.", 500, "INVALID_RESPONSE");
  }
  const occurrenceId = readId(item);
  const title = toStringValue(
    item.title,
    toStringValue(item.billName, "Bill"),
  );

  return {
    occurrenceId,
    id: occurrenceId,
    billSeriesId: readBillSeriesId(item),

    billName: title,
    title,

    amount: toNumber(item.amount),

    dueDate: toStringValue(item.dueDate),
    periodStart: toNullableString(item.periodStart),
    periodEnd: toNullableString(item.periodEnd),

    category: toStringValue(
      item.category,
      toStringValue(item.categoryName, "Uncategorized"),
    ),

    status: toStringValue(item.status, "Upcoming"),
    displayStatus: toStringValue(
      item.displayStatus,
      toStringValue(item.status, "Upcoming"),
    ),

    frequency: toStringValue(
      item.frequency,
      toStringValue(item.occurrenceType, "Scheduled"),
    ),
    occurrenceType: toStringValue(item.occurrenceType),
    amountType:
      toStringValue(item.amountType).toLowerCase() === "variable"
        ? "Variable"
        : toStringValue(item.amountType).toLowerCase() === "fixed"
          ? "Fixed"
          : fallbackAmountType,

    canRecordPayment: toBoolean(item.canRecordPayment),
    canSkip: toBoolean(item.canSkip),
    canCancel: toBoolean(item.canCancel),
    canRenewEarly: toBoolean(item.canRenewEarly),
    canTopUp: toBoolean(item.canTopUp),
    allowsTopUp: toBoolean(item.allowsTopUp) || toBoolean(item.canTopUp),
    paidAt: toNullableString(item.paidAt),
    notes: toNullableString(item.notes),
  };
}

export function parseBillOccurrencesPage(response: unknown): BillOccurrencesPage {
  const data = unwrapData(response);
  const items = extractArray(data).map((item) => parseBillOccurrence(item));
  const envelope = isObject(data) ? (data as Envelope) : {};

  return {
    items,

    pageNumber: Math.max(
      1,
      toNumber(envelope.pageNumber) || 1,
    ),

    pageSize: Math.max(
      1,
      toNumber(envelope.pageSize) || items.length || 6,
    ),

    totalCount: Math.max(
      0,
      toNumber(envelope.totalCount) || items.length,
    ),
  };
}

function parseBillPayment(item: unknown): BillPayment {
  if (!isObject(item)) {
    throw new ApiError("Bill payment is invalid.", 500, "INVALID_RESPONSE");
  }

  return {
    id: toStringValue(item.id),
    billOccurrenceId: toStringValue(item.billOccurrenceId),
    billSeriesId: readBillSeriesId(item),
    transactionId: toNullableString(item.transactionId),
    status: toStringValue(item.status, "Completed"),
    paidAt: toNullableString(item.paidAt ?? item.paymentDate),
    amountPaid: toNumber(item.amountPaid ?? item.amount),
    amount: toNumber(item.amount ?? item.amountPaid),
    notes: toNullableString(item.notes),
    reversalTransactionId: toNullableString(item.reversalTransactionId),
    reversedAt: toNullableString(item.reversedAt ?? item.refundedAt),
    reversalReason: toNullableString(item.reversalReason ?? item.refundReason),
  };
}

function parseBill(item: unknown): Bill {
  if (!isObject(item)) {
    throw new ApiError("Bill item is invalid.", 500, "INVALID_RESPONSE");
  }

  const id = readBillSeriesId(item) || readId(item);
  const amountType: BillAmountType =
    toStringValue(item.amountType).toLowerCase() === "variable"
      ? "Variable"
      : "Fixed";

  return {
    id,
    billSeriesId: id,
    name: toStringValue(item.name, toStringValue(item.title, "Bill")),
    description: toStringValue(item.description),
    categoryId: toStringValue(item.categoryId),
    categoryName: toStringValue(item.categoryName, "Uncategorized"),
    defaultAmount:
      amountType === "Variable"
        ? null
        : toNullableNumber(item.defaultAmount ?? item.amount),
    amountType,
    frequency: toStringValue(item.frequency),
    dueDay: toNullableNumber(item.dueDay),
    dueDate: toNullableString(item.dueDate),
    startDate: toNullableString(item.startDate),
    endDate: toNullableString(item.endDate),
    reminderDaysBefore: toNumber(item.reminderDaysBefore),
    allowsEarlyRenewal: toBoolean(item.allowsEarlyRenewal),
    allowsTopUp: toBoolean(item.allowsTopUp),
    isActive: item.isActive !== false,
    currentOccurrence: isObject(item.currentOccurrence)
      ? parseBillOccurrence(item.currentOccurrence, amountType)
      : null,
  };
}

export function parseBills(response: unknown): Bill[] {
  return extractArray(response).map(parseBill);
}

export function parseBillDetails(response: unknown): BillDetails {
  const data = unwrapData(response);
  if (!isObject(data)) {
    throw new ApiError("Bill details response is invalid.", 500, "INVALID_RESPONSE");
  }
  const bill = parseBill(data);
  const occurrences = Array.isArray(data.occurrences)
    ? data.occurrences.map((occurrence) =>
        parseBillOccurrence(occurrence, bill.amountType),
      )
    : [];
  const payments = Array.isArray(data.payments)
    ? data.payments.map(parseBillPayment)
    : [];

  return {
    ...bill,
    occurrences,
    payments,
  };
}

type BillPayloadForm = {
  name: string;
  description: string;
  categoryId: string;
  amountType: BillAmountType;
  defaultAmount: string | number | null;
  frequency: BillFrequency | string;
  dueDay: string | number | null;
  dueDate: string | null;
  startDate: string | null;
  endDate: string | null;
  reminderDaysBefore: string | number;
  allowsEarlyRenewal: boolean;
  allowsTopUp: boolean;
};

function toIsoDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function buildBillPayload(
  form: BillPayloadForm,
  isActive = true,
): {
  name: string;
  description: string;
  categoryId: string;
  defaultAmount: number | null;
  amountType: BillAmountType;
  frequency: BillFrequency | string;
  dueDate: string | null;
  dueDay: number | null;
  startDate: string | null;
  endDate: string | null;
  reminderDaysBefore: number;
  allowsEarlyRenewal: boolean;
  allowsTopUp: boolean;
  isActive: boolean;
} {
  const isMonthly = form.frequency === "Monthly";
  const isFixed = form.amountType === "Fixed";

  return {
    name: form.name.trim(),
    description: form.description.trim(),
    categoryId: form.categoryId,
    defaultAmount: isFixed ? Number(form.defaultAmount) : null,
    amountType: form.amountType,
    frequency: form.frequency,
    dueDay: isMonthly ? Number(form.dueDay) : null,
    dueDate: isMonthly ? null : toIsoDate(form.dueDate),
    startDate: toIsoDate(form.startDate),
    endDate: toIsoDate(form.endDate),
    reminderDaysBefore: Number(form.reminderDaysBefore),
    allowsEarlyRenewal: form.allowsEarlyRenewal,
    allowsTopUp: form.allowsTopUp,
    isActive,
  };
}
