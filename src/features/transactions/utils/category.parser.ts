import { ApiError } from "../../../infrastructure/api/api-error";
import type { TransactionCategoryDto } from "../api/category.dto";
import type { TransactionCategory } from "../types/category.types";

type CategoryEnvelope = {
  data?: unknown;
  result?: unknown;
  payload?: unknown;
  categories?: unknown;
  category?: unknown;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.trim().toLowerCase() === "true";
  if (typeof value === "number") return value === 1;
  return fallback;
}

function parseCategoryType(
  value: unknown,
  fallbackType?: TransactionCategory["categoryType"],
): TransactionCategory["categoryType"] {
  const normalized = readTrimmedString(value).toLowerCase();

  if (normalized === "expense") {
    return "Expense";
  }

  if (normalized === "income") {
    return "Income";
  }

  if (value === 0 || value === "0") {
    return "Expense";
  }

  if (value === 1 || value === "1") {
    return "Income";
  }

  if (fallbackType) {
    return fallbackType;
  }

  throw new ApiError("Category type is invalid.", 500, "INVALID_RESPONSE");
}

export function parseCategory(
  dto: unknown,
  fallbackType?: TransactionCategory["categoryType"],
): TransactionCategory {
  if (!isObject(dto)) {
    throw new ApiError("Category item is invalid.", 500, "INVALID_RESPONSE");
  }

  const categoryDto = dto as TransactionCategoryDto;
  const id = readTrimmedString(categoryDto.id);
  const name = readTrimmedString(categoryDto.name);

  if (!id) {
    throw new ApiError("Category id is missing.", 500, "INVALID_RESPONSE");
  }

  if (!name) {
    throw new ApiError("Category name is missing.", 500, "INVALID_RESPONSE");
  }

  return {
    id,
    name,
    categoryType: parseCategoryType(categoryDto.categoryType ?? categoryDto.type, fallbackType),
    isBillCategory: readBoolean(categoryDto.isBillCategory),
  };
}

export function parseCategories(response: unknown): TransactionCategory[] {
  if (Array.isArray(response)) {
    return response.map((item) => parseCategory(item));
  }

  if (!isObject(response)) {
    throw new ApiError("Categories response is invalid.", 500, "INVALID_RESPONSE");
  }

  const envelope = response as CategoryEnvelope;
  const candidate =
    envelope.data ?? envelope.result ?? envelope.payload ?? envelope.categories;

  if (!Array.isArray(candidate)) {
    throw new ApiError("Categories response is invalid.", 500, "INVALID_RESPONSE");
  }

  return candidate.map((item) => parseCategory(item));
}

export function parseCreatedCategory(
  response: unknown,
  fallbackType?: TransactionCategory["categoryType"],
): TransactionCategory | null {
  if (typeof response === "undefined" || response === null || response === "") {
    return null;
  }

  if (!isObject(response)) {
    return null;
  }

  const envelope = response as CategoryEnvelope;
  const candidate =
    envelope.data ?? envelope.result ?? envelope.payload ?? envelope.category ?? response;

  if (!isObject(candidate)) {
    return null;
  }

  return parseCategory(candidate, fallbackType);
}
