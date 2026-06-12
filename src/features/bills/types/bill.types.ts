export type BillStatus = "DueToday" | "DueSoon" | "Upcoming" | "Paid" | "Overdue";

export type PaginatedResponse<T> = {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
};

export type BillSummary = {
  totalBills: number;
  dueThisWeek: number;
  paidThisMonth: number;
  overdue: number;
  nextBill: BillNextBill | null;
};

export type BillNextBill = {
  occurrenceId: string;
  billSeriesId: string;
  billName: string;
  amount: number;
  dueDate: string;
  category: string;
  frequency: string;
  paymentStatus: BillStatus | string;
  amountType: BillAmountType | null;
  canRecordPayment: boolean;
};

export type BillCalendarOccurrence = {
  occurrenceId: string;
  billName: string;
  dueDate: string;
  status: BillStatus | string;
};

export type BillOccurrence = {
  occurrenceId: string;
  id: string;
  billSeriesId: string;
  billName: string;
  title: string;
  amount: number;
  dueDate: string;
  periodStart: string | null;
  periodEnd: string | null;
  category: string;
  status: BillStatus | string;
  displayStatus: string;
  frequency: string;
  occurrenceType: string;
  amountType: BillAmountType | null;
  canRecordPayment: boolean;
  canSkip: boolean;
  canCancel: boolean;
  canRenewEarly: boolean;
  canTopUp: boolean;
  allowsTopUp: boolean;
  paidAt: string | null;
  notes: string | null;
};

export type BillOccurrencesPage = PaginatedResponse<BillOccurrence>;

export type BillOccurrenceFilters = {
  search?: string;
  status?: string;
  category?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  pageNumber?: number;
  pageSize?: number;
};

export type RecordBillPaymentInput = {
  occurrenceId: string;
  amount: number;
  paidAt: string;
  notes: string;
};

export type BillAmountType = "Fixed" | "Variable";
export type BillFrequency = "OneTime" | "Monthly" | "Yearly";

export type CreateBillInput = {
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
};

export type UpdateBillInput = CreateBillInput;

export type Bill = CreateBillInput & {
  id: string;
  billSeriesId: string;
  categoryName: string;
  currentOccurrence: BillOccurrence | null;
};

export type BillPayment = {
  id: string;
  billOccurrenceId: string;
  billSeriesId: string;
  transactionId: string | null;
  status: string;
  paidAt: string | null;
  amountPaid: number;
  amount: number;
  notes: string | null;
  reversalTransactionId: string | null;
  reversedAt: string | null;
  reversalReason: string | null;
};

export type BillDetails = CreateBillInput & {
  id: string;
  billSeriesId: string;
  categoryName: string;
  currentOccurrence: BillOccurrence | null;
  occurrences: BillOccurrence[];
  payments: BillPayment[];
};

export type TopUpBillInput = {
  billSeriesId: string;
  amount: number;
  paidAt: string;
  notes: string | null;
};

export type OccurrenceNotesInput = {
  occurrenceId: string;
  notes?: string;
};
