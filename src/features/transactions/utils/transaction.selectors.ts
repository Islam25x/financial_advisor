import type { Transaction } from "../types/transaction.types";
import {
  TransactionCategory,
  TransactionType,
} from "../types/transaction.enums";
import {
  getTransactionDisplayTitle,
  normalizeOptionalTransactionItem,
} from "./transaction-item";
import {
  toTransactionMonthKey,
} from "./transaction-dates";

export type NormalizedTransactionType = TransactionType | "unknown";

export type TransactionRowData = {
  id: string;
  item?: string | null;
  displayTitle: string;
  date?: string;
  amount: number;
  merchant?: string | null;
  type: NormalizedTransactionType;
  category: TransactionCategory;
  rawCategory?: string;
  transaction: Transaction;
};

export type TransactionsInsights = {
  spendingChange: number;
  isSpendingUp: boolean;
  topCategory: TransactionCategory;
  tip: string;
};

const DEFAULT_TIP = "Reduce delivery - save 120";

const normalizeAmount = (amount: number) => Math.abs(amount);

export function normalizeTransactionType(transaction: Transaction): NormalizedTransactionType {
  const raw = `${transaction.type ?? ""}`.toLowerCase().trim();

  if (raw === TransactionType.Income.toLowerCase()) {
    return TransactionType.Income;
  }

  if (raw === TransactionType.Expense.toLowerCase() || raw === "expence") {
    return TransactionType.Expense;
  }

  return "unknown";
}

export function normalizeTransactionCategory(value?: string): TransactionCategory {
  const normalized = `${value ?? ""}`.toLowerCase().trim();

  if (!normalized) {
    return TransactionCategory.Other;
  }

  if (["income"].includes(normalized)) return TransactionCategory.Income;
  if (["salary"].includes(normalized)) return TransactionCategory.Salary;
  if (["food", "restaurant", "groceries"].includes(normalized)) return TransactionCategory.Food;
  if (["transport", "ride", "uber", "taxi"].includes(normalized)) return TransactionCategory.Transport;
  if (["shopping", "retail"].includes(normalized)) return TransactionCategory.Shopping;
  if (["goals", "goal"].includes(normalized)) return TransactionCategory.Other;
  if (["utilities", "bills"].includes(normalized)) return TransactionCategory.Utilities;
  if (["entertainment", "streaming"].includes(normalized)) {
    return TransactionCategory.Entertainment;
  }
  if (["health", "medical"].includes(normalized)) return TransactionCategory.Health;
  if (["transfer", "bank"].includes(normalized)) return TransactionCategory.Transfer;

  return TransactionCategory.Other;
}

export function mapTransactionsForTable(transactions: Transaction[]): TransactionRowData[] {
  return transactions.map((transaction) => ({
    id: transaction.id,
    item: transaction.item,
    displayTitle: getTransactionDisplayTitle(transaction),
    date: transaction.date,
    amount: transaction.amount,
    merchant: normalizeOptionalTransactionItem(transaction.merchant),
    type: normalizeTransactionType(transaction),
    category: normalizeTransactionCategory(transaction.category),
    rawCategory: transaction.category || "Other",
    transaction,
  }));
}

export function selectRecentTransactions(transactions: Transaction[], limit = 3) {
  return transactions.slice(0, limit);
}

const getMonthKey = (value?: string) => {
  return toTransactionMonthKey(value);
};

const getLatestMonthKey = (transactions: Transaction[]) => {
  const keys = transactions
    .map((transaction) => getMonthKey(transaction.date))
    .filter(Boolean);

  return keys.sort().pop() ?? "";
};

const getPreviousMonthKey = (monthKey: string) => {
  if (!monthKey) return "";
  const [yearString, monthString] = monthKey.split("-");
  const year = Number(yearString);
  const month = Number(monthString);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return "";
  const previousMonth = month === 1 ? 12 : month - 1;
  const previousYear = month === 1 ? year - 1 : year;
  return `${previousYear}-${`${previousMonth}`.padStart(2, "0")}`;
};

const calcPercentChange = (current: number, previous: number) => {
  if (previous <= 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
};

const summarize = (transactions: Transaction[]) => {
  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach((transaction) => {
    const type = normalizeTransactionType(transaction);
    const amount = normalizeAmount(transaction.amount);

    if (type === TransactionType.Income) {
      totalIncome += amount;
    }

    if (type === TransactionType.Expense) {
      totalExpenses += amount;
    }
  });

  return {
    totalIncome,
    totalExpenses,
  };
};

export function selectTransactionsInsights(transactions: Transaction[]): TransactionsInsights {
  const latestMonthKey = getLatestMonthKey(transactions);
  const previousMonthKey = getPreviousMonthKey(latestMonthKey);

  const currentMonthExpenses = summarize(
    latestMonthKey
      ? transactions.filter(
          (transaction) =>
            normalizeTransactionType(transaction) === TransactionType.Expense &&
            getMonthKey(transaction.date) === latestMonthKey,
        )
      : [],
  ).totalExpenses;
  const previousMonthExpenses = summarize(
    previousMonthKey
      ? transactions.filter(
          (transaction) =>
            normalizeTransactionType(transaction) === TransactionType.Expense &&
            getMonthKey(transaction.date) === previousMonthKey,
        )
      : [],
  ).totalExpenses;

  const spendingChange = calcPercentChange(currentMonthExpenses, previousMonthExpenses);
  const isSpendingUp = spendingChange >= 0;

  const categoryCounts = transactions.reduce<Record<string, number>>((acc, transaction) => {
    const category = normalizeTransactionCategory(transaction.category);
    acc[category] = (acc[category] ?? 0) + 1;
    return acc;
  }, {});
  const topCategoryKey =
    Object.entries(categoryCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ??
    TransactionCategory.Other;

  return {
    spendingChange,
    isSpendingUp,
    topCategory: topCategoryKey as TransactionCategory,
    tip: DEFAULT_TIP,
  };
}
