import { ApiError } from "../../../infrastructure/api/api-error";
import {
  BackendSavingPlanMonthlyProgressResponseSchema,
  BackendSavingPlanProgressResponseSchema,
  BackendSavingPlanResponseSchema,
  GenerateSavingPlanRequestSchema,
  SavingPlanMonthlyProgressItemSchema,
  SavingPlanMonthlyProgressResponseSchema,
  SavingPlanProgressResponseSchema,
  SavingPlanResponseSchema,
  type BackendSavingPlanMonthlyProgressItemDto,
  type BackendSavingPlanMonthlyProgressResponseDto,
  type BackendSavingPlanProgressResponseDto,
  type BackendSavingPlanResponseDto,
  type GenerateSavingPlanRequestDto,
  type SavingPlanMonthlyProgressItemDto,
  type SavingPlanMonthlyProgressResponseDto,
  type SavingPlanProgressResponseDto,
  type SavingPlanItemDto,
  type SavingPlanResponseDto,
} from "../api/saving-plan.dto";
import {
  SavingPlanFormInputSchema,
  SavingPlanFormStateSchema,
  type SavingPlanFormErrors,
  type SavingPlanFormInput,
  type SavingPlanFormState,
  type SavingPlanCurrentProgress,
  type SavingPlanMonthlyProgressPoint,
  type SavingPlanProgressStatusVariant,
} from "../types/saving-plan.types";

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function unwrapResponse(response: unknown): unknown {
  if (!isObject(response)) {
    return response;
  }

  if (response.data !== undefined) {
    return unwrapResponse(response.data);
  }

  if (response.result !== undefined) {
    return unwrapResponse(response.result);
  }

  if (response.payload !== undefined) {
    return unwrapResponse(response.payload);
  }

  return response;
}

function toOptionalNumber(value: number | string | null | undefined): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function toOptionalString(value: string | null | undefined): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

const PLAN_TYPE_BY_NUMBER = {
  0: "Easy",
  1: "Balanced",
  2: "Aggressive",
} as const;

const PLAN_TYPE_BY_LABEL = {
  easy: "Easy",
  balanced: "Balanced",
  aggressive: "Aggressive",
} as const;

function mapPlanType(value: BackendSavingPlanResponseDto["planType"]): SavingPlanResponseDto["PlanType"] {
  if (typeof value === "number" && value in PLAN_TYPE_BY_NUMBER) {
    return PLAN_TYPE_BY_NUMBER[value as keyof typeof PLAN_TYPE_BY_NUMBER];
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized in PLAN_TYPE_BY_LABEL) {
      return PLAN_TYPE_BY_LABEL[normalized as keyof typeof PLAN_TYPE_BY_LABEL];
    }

    const numericValue = Number(normalized);
    if (Number.isInteger(numericValue) && numericValue in PLAN_TYPE_BY_NUMBER) {
      return PLAN_TYPE_BY_NUMBER[numericValue as keyof typeof PLAN_TYPE_BY_NUMBER];
    }
  }

  throw new ApiError("Saving plan field \"planType\" is invalid.", 500, "INVALID_RESPONSE");
}

const DIFFICULTY_BY_NUMBER = {
  0: "Easy",
  1: "Balanced",
  2: "Aggressive",
} as const;

const STATUS_BY_NUMBER = {
  0: "Active",
  1: "Inactive",
  2: "Completed",
  3: "Deactivated",
} as const;

function mapDifficulty(value: number | string | null | undefined): string | undefined {
  if (typeof value === "number" && value in DIFFICULTY_BY_NUMBER) {
    return DIFFICULTY_BY_NUMBER[value as keyof typeof DIFFICULTY_BY_NUMBER];
  }

  if (typeof value === "string" && value.trim()) {
    const normalized = value.trim();
    const numericValue = Number(normalized);

    if (Number.isInteger(numericValue) && numericValue in DIFFICULTY_BY_NUMBER) {
      return DIFFICULTY_BY_NUMBER[numericValue as keyof typeof DIFFICULTY_BY_NUMBER];
    }

    return normalized;
  }

  return undefined;
}

function mapStatus(value: number | string | null | undefined): string | undefined {
  if (typeof value === "number" && value in STATUS_BY_NUMBER) {
    return STATUS_BY_NUMBER[value as keyof typeof STATUS_BY_NUMBER];
  }

  if (typeof value === "string" && value.trim()) {
    const normalized = value.trim();
    const numericValue = Number(normalized);

    if (Number.isInteger(numericValue) && numericValue in STATUS_BY_NUMBER) {
      return STATUS_BY_NUMBER[numericValue as keyof typeof STATUS_BY_NUMBER];
    }

    return normalized;
  }

  return undefined;
}

function mapItems(items: BackendSavingPlanResponseDto["items"]): SavingPlanItemDto[] {
  return (items ?? []).reduce<SavingPlanItemDto[]>((mappedItems, item) => {
    const category = toOptionalString(item.category) ?? toOptionalString(item.categoryName);
    const recommendedAmount = toOptionalNumber(item.recommendedAmount);

    if (category && recommendedAmount !== undefined) {
      mappedItems.push({
        Category: category,
        RecommendedAmount: recommendedAmount,
      });
    }

    return mappedItems;
  }, []);
}

function mapStringList(items: Array<string | null> | null | undefined): string[] {
  return (items ?? []).filter((item): item is string => typeof item === "string" && item.trim() !== "");
}

function logSavingPlanParseFailure(
  response: unknown,
  issues: Array<{ path: Array<string | number>; message: string }>,
): void {
  if (!import.meta.env.DEV) {
    return;
  }

  console.error("[saving-plan] Failed to parse generate response", {
    response,
    issues,
    fields: issues.map((issue) => issue.path.join(".")).filter(Boolean),
  });
}

function readOptionalNumber(value: number | string | null | undefined): number | undefined {
  return toOptionalNumber(value);
}

function mapBackendSavingPlanResponse(dto: BackendSavingPlanResponseDto): SavingPlanResponseDto {
  const recommendedMonthlySaving = toOptionalNumber(dto.recommendedMonthlySaving);
  const targetMonthlySaving = toOptionalNumber(dto.targetMonthlySaving) ?? recommendedMonthlySaving;
  const analysisPeriodMonths = toOptionalNumber(dto.analysisPeriodMonths);
  const mappedResponse = {
    Id: dto.id,
    PlanType: mapPlanType(dto.planType),
    RecommendedMonthlySaving: recommendedMonthlySaving,
    CurrentAverageSaving: toOptionalNumber(dto.currentAverageSaving),
    ExtraSavingOpportunity: toOptionalNumber(dto.extraSavingOpportunity),
    AverageIncome: toOptionalNumber(dto.averageIncome),
    AverageExpenses: toOptionalNumber(dto.averageExpenses),
    ForecastedIncome: toOptionalNumber(dto.forecastedIncome),
    ForecastedExpenses: toOptionalNumber(dto.forecastedExpenses),
    ForecastedSaving: toOptionalNumber(dto.forecastedSaving),
    AnalysisPeriodMonths: analysisPeriodMonths,
    PlanDifficulty: mapDifficulty(dto.difficulty),
    Status: mapStatus(dto.status),
    AppliedAt: dto.appliedAt ?? null,
    SummaryMessage: toOptionalString(dto.summaryMessage),
    Duration: analysisPeriodMonths !== undefined ? `${analysisPeriodMonths} Months` : undefined,
    TargetMonthlySaving: targetMonthlySaving,
    StartDate: dto.startDate ?? null,
    EndDate: dto.endDate ?? null,
    Insights: mapStringList(dto.insights),
    Items: mapItems(dto.items),
    Warnings: mapStringList(dto.warnings),
  };

  const parsed = SavingPlanResponseSchema.safeParse(mappedResponse);

  if (!parsed.success) {
    logSavingPlanParseFailure(mappedResponse, parsed.error.issues);
    throw new ApiError("Saving plan response could not be mapped for preview.", 500, "INVALID_RESPONSE");
  }

  return parsed.data;
}

function mapBackendProgressResponse(
  dto: BackendSavingPlanProgressResponseDto,
): SavingPlanProgressResponseDto {
  const mappedResponse = {
    SavingPlanId: toOptionalString(dto.savingPlanId ?? undefined),
    ProgressPercentage: readOptionalNumber(dto.progressPercentage),
    CurrentSavedAmount: readOptionalNumber(dto.currentSavedAmount),
    TargetSavingAmount: readOptionalNumber(dto.targetSavingAmount),
    RecommendedMonthlySaving: readOptionalNumber(dto.recommendedMonthlySaving),
    CurrentAverageSaving: readOptionalNumber(dto.currentAverageSaving),
    RemainingAmount: readOptionalNumber(dto.remainingAmount),
    ElapsedMonths: readOptionalNumber(dto.elapsedMonths),
    RemainingMonths: readOptionalNumber(dto.remainingMonths),
    Status: mapStatus(dto.status),
    LastSyncedAt: dto.lastSyncedAt ?? null,
    UpdatedAt: dto.updatedAt ?? null,
  };

  const parsed = SavingPlanProgressResponseSchema.safeParse(mappedResponse);

  if (!parsed.success) {
    logSavingPlanParseFailure(mappedResponse, parsed.error.issues);
    throw new ApiError("Saving plan progress response could not be mapped.", 500, "INVALID_RESPONSE");
  }

  return parsed.data;
}

function toOptionalInteger(value: number | string | null | undefined): number | undefined {
  const parsedValue = toOptionalNumber(value);

  if (parsedValue === undefined || !Number.isInteger(parsedValue)) {
    return undefined;
  }

  return parsedValue;
}

function mapBackendMonthlyProgressItem(
  item: BackendSavingPlanMonthlyProgressItemDto,
): SavingPlanMonthlyProgressItemDto {
  const mappedItem = {
    Id: toOptionalString(item.id ?? undefined),
    Month: toOptionalInteger(item.month),
    Year: toOptionalInteger(item.year),
    Label: toOptionalString(item.label ?? undefined),
    SavedAmount: readOptionalNumber(item.savedAmount),
    TargetAmount: readOptionalNumber(item.targetAmount),
    ProgressPercentage: readOptionalNumber(item.progressPercentage),
    Income: readOptionalNumber(item.income),
    Expenses: readOptionalNumber(item.expenses),
    Saving: readOptionalNumber(item.saving),
    CreatedAt: item.createdAt ?? null,
    UpdatedAt: item.updatedAt ?? null,
  };

  const parsed = SavingPlanMonthlyProgressItemSchema.safeParse(mappedItem);

  if (!parsed.success) {
    logSavingPlanParseFailure(mappedItem, parsed.error.issues);
    throw new ApiError("Saving plan monthly progress item could not be mapped.", 500, "INVALID_RESPONSE");
  }

  return parsed.data;
}

function readMonthlyProgressItems(
  dto: BackendSavingPlanMonthlyProgressResponseDto,
): BackendSavingPlanMonthlyProgressItemDto[] {
  if (Array.isArray(dto)) {
    return dto;
  }

  return dto.items ?? [];
}

function readRecordValue(record: Record<string, unknown>, key: string): unknown {
  return record[key] ?? record[key.charAt(0).toUpperCase() + key.slice(1)];
}

function readNumberField(record: Record<string, unknown>, key: string): number {
  return toOptionalNumber(readRecordValue(record, key) as number | string | null | undefined) ?? 0;
}

function readStringField(record: Record<string, unknown>, key: string): string {
  const value = readRecordValue(record, key);
  return typeof value === "string" ? value.trim() : "";
}

function readNullableStringField(record: Record<string, unknown>, key: string): string | null {
  const value = readRecordValue(record, key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

const MONTHLY_STATUS_BY_NUMBER: Record<number, string> = {
  0: "Unknown",
  1: "Below Target",
  2: "Near Target",
  3: "On Track",
  4: "Exceeded",
};

function formatStatusLabel(value: unknown): string {
  if (typeof value === "number" && Number.isInteger(value)) {
    return MONTHLY_STATUS_BY_NUMBER[value] ?? `Status ${value}`;
  }

  if (typeof value === "string" && value.trim()) {
    const trimmed = value.trim();
    const numericValue = Number(trimmed);

    if (Number.isInteger(numericValue)) {
      return MONTHLY_STATUS_BY_NUMBER[numericValue] ?? `Status ${numericValue}`;
    }

    return trimmed
      .replace(/[_-]+/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\s+/g, " ")
      .trim();
  }

  return "Unknown";
}

function getStatusVariant(status: string): SavingPlanProgressStatusVariant {
  const normalized = status.toLowerCase().replace(/\s+/g, "");

  if (["ontrack", "achieved", "exceeded", "good", "neartarget", "completed"].includes(normalized)) {
    return "success";
  }

  if (["behind", "warning", "belowtarget", "below"].includes(normalized)) {
    return "warning";
  }

  if (["critical", "failed", "overbudget", "danger"].includes(normalized)) {
    return "danger";
  }

  return "info";
}

function getMonthLabel(year: number, month: number): string {
  const date = new Date(Date.UTC(year, Math.max(0, month - 1), 1));

  if (Number.isNaN(date.getTime())) {
    return `${month}/${year}`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function readCategoryProgress(response: unknown): SavingPlanCurrentProgress["categoryProgress"] {
  if (!Array.isArray(response)) return [];

  return response
    .filter(isObject)
    .map((item) => ({
      categoryId: readNullableStringField(item, "categoryId"),
      categoryName: readStringField(item, "categoryName") || "Uncategorized",
      recommendedBudget: readNumberField(item, "recommendedBudget"),
      actualSpent: readNumberField(item, "actualSpent"),
      difference: readNumberField(item, "difference"),
      status: formatStatusLabel(readRecordValue(item, "status")),
    }));
}

function createProgressSummary(progress: Omit<SavingPlanCurrentProgress, "summary" | "categoryProgress">): string {
  const absoluteDifference = Math.abs(progress.difference);
  const direction = progress.difference < 0 ? "below" : "above";

  return `You saved ${Math.round(progress.actualSaving).toLocaleString("en-US")} this month, ${Math.round(absoluteDifference).toLocaleString("en-US")} ${direction} the recommended target.`;
}

export function parseGenerateSavingPlanPayload(
  input: SavingPlanFormInput,
): GenerateSavingPlanRequestDto {
  const payload = {
    months: input.months,
    planType: input.planType,
    targetMonthlySaving:
      input.targetMonthlySaving === undefined
        ? undefined
        : roundToTwoDecimals(input.targetMonthlySaving),
  };

  const parsed = GenerateSavingPlanRequestSchema.safeParse(payload);

  if (!parsed.success) {
    throw new ApiError("Saving plan input is invalid.", 400, "INVALID_RESPONSE");
  }

  return parsed.data;
}

function normalizeOptionalAmount(value: string): number | undefined {
  const normalized = value.trim().replace(/,/g, "");

  if (!normalized) {
    return undefined;
  }

  return Number(normalized);
}

function mapFormErrors(formState: SavingPlanFormState): SavingPlanFormErrors {
  const result = SavingPlanFormStateSchema.safeParse(formState);
  const errors: SavingPlanFormErrors = {};

  if (result.success) {
    return errors;
  }

  for (const issue of result.error.issues) {
    const field = issue.path[0];

    if (
      field === "months" ||
      field === "planType" ||
      field === "targetMonthlySaving"
    ) {
      errors[field] = issue.message;
    }
  }

  return errors;
}

export function parseSavingPlanFormInput(formState: SavingPlanFormState): {
  input?: SavingPlanFormInput;
  errors: SavingPlanFormErrors;
} {
  const errors = mapFormErrors(formState);

  if (Object.keys(errors).length > 0 || !formState.months || !formState.planType) {
    return { errors };
  }

  const parsed = SavingPlanFormInputSchema.safeParse({
    months: formState.months,
    planType: formState.planType,
    targetMonthlySaving: normalizeOptionalAmount(formState.targetMonthlySaving),
  });

  if (!parsed.success) {
    return {
      errors: mapFormErrors(formState),
    };
  }

  return {
    input: parsed.data,
    errors: {},
  };
}

export function parseSavingPlanResponse(response: unknown): SavingPlanResponseDto {
  const unwrappedResponse = unwrapResponse(response);
  const backendParsed = BackendSavingPlanResponseSchema.safeParse(unwrappedResponse);

  if (!backendParsed.success) {
    logSavingPlanParseFailure(unwrappedResponse, backendParsed.error.issues);
    throw new ApiError("Saving plan response did not match the expected backend contract.", 500, "INVALID_RESPONSE");
  }

  return mapBackendSavingPlanResponse(backendParsed.data);
}

export function parseActiveSavingPlanResponse(response: unknown): SavingPlanResponseDto | null {
  const unwrappedResponse = unwrapResponse(response);

  if (unwrappedResponse === undefined || unwrappedResponse === null) {
    return null;
  }

  return parseSavingPlanResponse(unwrappedResponse);
}

export function parseSavingPlanProgressResponse(
  response: unknown,
): SavingPlanProgressResponseDto {
  const unwrappedResponse = unwrapResponse(response);
  const backendParsed = BackendSavingPlanProgressResponseSchema.safeParse(unwrappedResponse);

  if (!backendParsed.success) {
    logSavingPlanParseFailure(unwrappedResponse, backendParsed.error.issues);
    throw new ApiError("Saving plan progress response did not match the expected backend contract.", 500, "INVALID_RESPONSE");
  }

  return mapBackendProgressResponse(backendParsed.data);
}

export function parseSavingPlanMonthlyProgressResponse(
  response: unknown,
): SavingPlanMonthlyProgressResponseDto {
  const unwrappedResponse = unwrapResponse(response);
  const backendParsed = BackendSavingPlanMonthlyProgressResponseSchema.safeParse(unwrappedResponse);

  if (!backendParsed.success) {
    logSavingPlanParseFailure(unwrappedResponse, backendParsed.error.issues);
    throw new ApiError("Saving plan monthly progress response did not match the expected backend contract.", 500, "INVALID_RESPONSE");
  }

  const mappedResponse = {
    Items: readMonthlyProgressItems(backendParsed.data).map(mapBackendMonthlyProgressItem),
  };

  const parsed = SavingPlanMonthlyProgressResponseSchema.safeParse(mappedResponse);

  if (!parsed.success) {
    logSavingPlanParseFailure(mappedResponse, parsed.error.issues);
    throw new ApiError("Saving plan monthly progress response could not be mapped.", 500, "INVALID_RESPONSE");
  }

  return parsed.data;
}

export function parseSavingPlanCurrentProgress(
  response: unknown,
): SavingPlanCurrentProgress | null {
  const unwrappedResponse = unwrapResponse(response);

  if (unwrappedResponse === undefined || unwrappedResponse === null) {
    return null;
  }

  if (!isObject(unwrappedResponse)) {
    throw new ApiError("Saving plan current progress response is invalid.", 500, "INVALID_RESPONSE");
  }

  const year = readNumberField(unwrappedResponse, "year");
  const month = readNumberField(unwrappedResponse, "month");
  const status = formatStatusLabel(readRecordValue(unwrappedResponse, "status"));
  const progress = {
    year,
    month,
    monthLabel: getMonthLabel(year, month),
    recommendedMonthlySaving: readNumberField(unwrappedResponse, "recommendedMonthlySaving"),
    actualIncome: readNumberField(unwrappedResponse, "actualIncome"),
    actualExpenses: readNumberField(unwrappedResponse, "actualExpenses"),
    actualSaving: readNumberField(unwrappedResponse, "actualSaving"),
    difference: readNumberField(unwrappedResponse, "difference"),
    progressPercentage: readNumberField(unwrappedResponse, "progressPercentage"),
    status,
    statusVariant: getStatusVariant(status),
  };

  return {
    ...progress,
    summary:
      readStringField(unwrappedResponse, "summary") ||
      createProgressSummary(progress),
    categoryProgress: readCategoryProgress(readRecordValue(unwrappedResponse, "categoryProgress")),
  };
}

function readMonthlyProgressArray(response: unknown): unknown[] {
  const unwrappedResponse = unwrapResponse(response);

  if (Array.isArray(unwrappedResponse)) return unwrappedResponse;

  if (isObject(unwrappedResponse)) {
    const items =
      unwrappedResponse.items ??
      unwrappedResponse.Items ??
      unwrappedResponse.monthlyProgress ??
      unwrappedResponse.MonthlyProgress;

    if (Array.isArray(items)) return items;
  }

  return [];
}

function parseMonthlyProgressPoint(item: Record<string, unknown>): SavingPlanMonthlyProgressPoint {
  const year = readNumberField(item, "year");
  const month = readNumberField(item, "month");
  const recommendedMonthlySaving =
    readNumberField(item, "recommendedMonthlySaving") ||
    readNumberField(item, "targetAmount");
  const actualSaving =
    readNumberField(item, "actualSaving") ||
    readNumberField(item, "saving") ||
    readNumberField(item, "savedAmount");
  const difference =
    readRecordValue(item, "difference") !== undefined
      ? readNumberField(item, "difference")
      : actualSaving - recommendedMonthlySaving;

  return {
    year,
    month,
    label: readStringField(item, "label") || getMonthLabel(year, month),
    actualProgress: readNumberField(item, "progressPercentage"),
    recommendedProgress: 100,
    actualSaving,
    recommendedMonthlySaving,
    difference,
    status: formatStatusLabel(readRecordValue(item, "status")),
  };
}

export function parseSavingPlanMonthlyProgress(
  response: unknown,
): SavingPlanMonthlyProgressPoint[] {
  return readMonthlyProgressArray(response)
    .filter(isObject)
    .map(parseMonthlyProgressPoint)
    .filter((item) => item.year > 0 && item.month > 0)
    .sort((left, right) => left.year - right.year || left.month - right.month)
    .slice(-6);
}
