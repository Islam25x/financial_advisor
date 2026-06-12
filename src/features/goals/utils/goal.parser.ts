import { ApiError } from "../../../infrastructure/api/api-error";
import {
  GoalSchema,
  type Goal,
  type GoalHistoryEntry,
  type GoalHistoryPage,
} from "../types/goal.types";

type GoalsEnvelope = {
  items?: unknown;
  data?: unknown;
  result?: unknown;
  payload?: unknown;
  pageNumber?: unknown;
  pageSize?: unknown;
  totalCount?: unknown;
};

export type GoalsPage = {
  items: Goal[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toSafeNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function calculateProgress(current: number, target: number): number {
  if (!target) {
    return 0;
  }

  return Math.min(100, Math.max(0, (current / target) * 100));
}

function extractGoalsData(response: unknown): unknown {
  if (Array.isArray(response)) {
    return response;
  }

  if (!isObject(response)) {
    throw new ApiError("Goals response is invalid.", 500, "INVALID_RESPONSE");
  }

  const candidate = response as GoalsEnvelope;

  if (candidate.items !== undefined) {
    return extractGoalsData(candidate.items);
  }

  if (candidate.data !== undefined) {
    return extractGoalsData(candidate.data);
  }

  if (candidate.result !== undefined) {
    return extractGoalsData(candidate.result);
  }

  if (candidate.payload !== undefined) {
    return extractGoalsData(candidate.payload);
  }

  throw new ApiError("Goals response is invalid.", 500, "INVALID_RESPONSE");
}

export function parseGoals(response: unknown): Goal[] {
  const data = extractGoalsData(response);

  if (!Array.isArray(data)) {
    throw new ApiError("Goals response is invalid.", 500, "INVALID_RESPONSE");
  }

  return data.map((item: any) => {
    const targetAmount = toSafeNumber(item.targetAmount);
    const currentAmount = toSafeNumber(item.currentAmount);
    const monthlyAmount = toSafeNumber(item.monthlyAmount);
    const progressPercentage = toSafeNumber(item.progressPercentage);
    const progress =
      Number.isFinite(progressPercentage) && progressPercentage > 0
        ? progressPercentage
        : calculateProgress(currentAmount, targetAmount);

    return GoalSchema.parse({
      id: item.goalId,
      title: typeof item.title === "string" ? item.title : "",
      description: typeof item.description === "string" ? item.description : "",
      targetAmount,
      currentAmount,
      progressPercentage: Math.min(100, Math.max(0, progress)),
      monthlyAmount,

      durationValue:
        monthlyAmount > 0
          ? Math.ceil(targetAmount / monthlyAmount)
          : 0,

      durationUnit: "Months",
    })
  }
  );
}

export function parseGoalsPage(response: unknown): GoalsPage {
  if (!isObject(response)) {
    throw new ApiError("Goals response is invalid.", 500, "INVALID_RESPONSE");
  }

  const candidate = response as GoalsEnvelope;
  const items = parseGoals(response);

  return {
    items,
    pageNumber: Math.max(1, toSafeNumber(candidate.pageNumber) || 1),
    pageSize: Math.max(1, toSafeNumber(candidate.pageSize) || items.length || 2),
    totalCount: Math.max(0, toSafeNumber(candidate.totalCount) || items.length),
  };
}

type GoalHistoryEnvelope = {
  items?: unknown;
  data?: unknown;
  result?: unknown;
  payload?: unknown;
  pageNumber?: unknown;
  pageSize?: unknown;
  totalCount?: unknown;
};

function parseGoalHistoryEntry(item: unknown, index: number): GoalHistoryEntry {
  if (!isObject(item)) {
    throw new ApiError("Goal history item is invalid.", 500, "INVALID_RESPONSE");
  }

  const occurredAt =
    (typeof item.occurredAt === "string" && item.occurredAt) ||
    (typeof item.createdAt === "string" && item.createdAt) ||
    (typeof item.contributedAt === "string" && item.contributedAt) ||
    (typeof item.date === "string" && item.date) ||
    (typeof item.createdOn === "string" && item.createdOn) ||
    "";

  return {
    id:
      (typeof item.id === "string" && item.id) ||
      (typeof item.contributionId === "string" && item.contributionId) ||
      `${index}`,
    amount: toSafeNumber(item.amount),
    occurredAt,
  };
}

export function parseGoalHistory(response: unknown): GoalHistoryPage {
  if (!isObject(response)) {
    throw new ApiError("Goal history response is invalid.", 500, "INVALID_RESPONSE");
  }

  let candidate = response as GoalHistoryEnvelope;

  while (
    isObject(candidate.data) ||
    isObject(candidate.result) ||
    isObject(candidate.payload)
  ) {
    candidate = (
      (isObject(candidate.data) && candidate.data) ||
      (isObject(candidate.result) && candidate.result) ||
      (isObject(candidate.payload) && candidate.payload) ||
      candidate
    ) as GoalHistoryEnvelope;
  }

  const items = Array.isArray(candidate.items)
    ? candidate.items
    : Array.isArray(candidate.data)
      ? candidate.data
      : Array.isArray(candidate.result)
        ? candidate.result
        : Array.isArray(candidate.payload)
          ? candidate.payload
          : [];

  return {
    items: items.map(parseGoalHistoryEntry),
    pageNumber: Math.max(1, toSafeNumber(candidate.pageNumber) || 1),
    pageSize: Math.max(1, toSafeNumber(candidate.pageSize) || 2),
    totalCount: Math.max(0, toSafeNumber(candidate.totalCount) || items.length),
  };
}
