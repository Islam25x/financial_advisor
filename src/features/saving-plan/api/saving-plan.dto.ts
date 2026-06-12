import { z } from "zod";

const NullableNumberSchema = z.union([z.number().finite(), z.string()]).nullable().optional();
const NullableStringSchema = z.string().nullable().optional();
const BackendEnumSchema = z.union([z.number().int(), z.string()]);

export const GenerateSavingPlanRequestSchema = z.object({
  months: z.number().int().positive(),
  planType: z.enum(["Easy", "Balanced", "Aggressive"]),
  targetMonthlySaving: z.number().positive().optional(),
});

export const BackendSavingPlanItemSchema = z.object({
  category: z.string().optional().nullable(),
  categoryName: z.string().optional().nullable(),
  recommendedAmount: NullableNumberSchema,
});

export const BackendSavingPlanResponseSchema = z.object({
  id: z.string().min(1),
  planType: BackendEnumSchema,
  targetMonthlySaving: NullableNumberSchema,
  recommendedMonthlySaving: NullableNumberSchema,
  currentAverageSaving: NullableNumberSchema,
  extraSavingOpportunity: NullableNumberSchema,
  averageIncome: NullableNumberSchema,
  averageExpenses: NullableNumberSchema,
  forecastedIncome: NullableNumberSchema,
  forecastedExpenses: NullableNumberSchema,
  forecastedSaving: NullableNumberSchema,
  analysisPeriodMonths: NullableNumberSchema,
  difficulty: BackendEnumSchema.nullable().optional(),
  planStatusLabel: NullableStringSchema,
  status: BackendEnumSchema.nullable().optional(),
  appliedAt: NullableStringSchema,
  startDate: NullableStringSchema,
  endDate: NullableStringSchema,
  createdAt: NullableStringSchema,
  updatedAt: NullableStringSchema,
  summaryMessage: NullableStringSchema,
  insights: z.array(z.string().nullable()).nullable().optional(),
  warnings: z.array(z.string().nullable()).nullable().optional(),
  items: z.array(BackendSavingPlanItemSchema).nullable().optional(),
});

export const SavingPlanItemSchema = z.object({
  Category: z.string(),
  RecommendedAmount: z.number().finite(),
});

export const SavingPlanResponseSchema = z.object({
  Id: z.string().min(1),
  PlanType: z.enum(["Easy", "Balanced", "Aggressive"]),
  RecommendedMonthlySaving: z.number().finite().optional(),
  CurrentAverageSaving: z.number().finite().optional(),
  ExtraSavingOpportunity: z.number().finite().optional(),
  AverageIncome: z.number().finite().optional(),
  AverageExpenses: z.number().finite().optional(),
  ForecastedIncome: z.number().finite().optional(),
  ForecastedExpenses: z.number().finite().optional(),
  ForecastedSaving: z.number().finite().optional(),
  AnalysisPeriodMonths: z.number().finite().optional(),
  PlanDifficulty: z.string().optional(),
  PlanStatusLabel: z.string().optional(),
  Status: z.string().optional(),
  AppliedAt: z.string().nullable().optional(),
  SummaryMessage: z.string().optional(),
  Duration: z.string().optional(),
  TargetMonthlySaving: z.number().finite().optional(),
  StartDate: z.string().nullable().optional(),
  EndDate: z.string().nullable().optional(),
  Insights: z.array(z.string()),
  Items: z.array(SavingPlanItemSchema),
  Warnings: z.array(z.string()),
});

export const BackendSavingPlanProgressResponseSchema = z.object({
  savingPlanId: z.string().min(1).optional().nullable(),
  progressPercentage: NullableNumberSchema,
  currentSavedAmount: NullableNumberSchema,
  targetSavingAmount: NullableNumberSchema,
  recommendedMonthlySaving: NullableNumberSchema,
  currentAverageSaving: NullableNumberSchema,
  remainingAmount: NullableNumberSchema,
  elapsedMonths: NullableNumberSchema,
  remainingMonths: NullableNumberSchema,
  status: BackendEnumSchema.nullable().optional(),
  lastSyncedAt: NullableStringSchema,
  updatedAt: NullableStringSchema,
});

export const SavingPlanProgressResponseSchema = z.object({
  SavingPlanId: z.string().optional(),
  ProgressPercentage: z.number().finite().optional(),
  CurrentSavedAmount: z.number().finite().optional(),
  TargetSavingAmount: z.number().finite().optional(),
  RecommendedMonthlySaving: z.number().finite().optional(),
  CurrentAverageSaving: z.number().finite().optional(),
  RemainingAmount: z.number().finite().optional(),
  ElapsedMonths: z.number().finite().optional(),
  RemainingMonths: z.number().finite().optional(),
  Status: z.string().optional(),
  LastSyncedAt: z.string().nullable().optional(),
  UpdatedAt: z.string().nullable().optional(),
});

export const BackendSavingPlanMonthlyProgressItemSchema = z.object({
  id: z.string().optional().nullable(),
  month: z.union([z.number().int(), z.string()]).optional().nullable(),
  year: z.union([z.number().int(), z.string()]).optional().nullable(),
  label: z.string().optional().nullable(),
  savedAmount: NullableNumberSchema,
  targetAmount: NullableNumberSchema,
  progressPercentage: NullableNumberSchema,
  income: NullableNumberSchema,
  expenses: NullableNumberSchema,
  saving: NullableNumberSchema,
  createdAt: NullableStringSchema,
  updatedAt: NullableStringSchema,
});

export const BackendSavingPlanMonthlyProgressResponseSchema = z.union([
  z.array(BackendSavingPlanMonthlyProgressItemSchema),
  z.object({
    items: z.array(BackendSavingPlanMonthlyProgressItemSchema).nullable().optional(),
  }),
]);

export const SavingPlanMonthlyProgressItemSchema = z.object({
  Id: z.string().optional(),
  Month: z.number().int().optional(),
  Year: z.number().int().optional(),
  Label: z.string().optional(),
  SavedAmount: z.number().finite().optional(),
  TargetAmount: z.number().finite().optional(),
  ProgressPercentage: z.number().finite().optional(),
  Income: z.number().finite().optional(),
  Expenses: z.number().finite().optional(),
  Saving: z.number().finite().optional(),
  CreatedAt: z.string().nullable().optional(),
  UpdatedAt: z.string().nullable().optional(),
});

export const SavingPlanMonthlyProgressResponseSchema = z.object({
  Items: z.array(SavingPlanMonthlyProgressItemSchema),
});

export type GenerateSavingPlanRequestDto = z.infer<typeof GenerateSavingPlanRequestSchema>;
export type BackendSavingPlanItemDto = z.infer<typeof BackendSavingPlanItemSchema>;
export type BackendSavingPlanResponseDto = z.infer<typeof BackendSavingPlanResponseSchema>;
export type SavingPlanItemDto = z.infer<typeof SavingPlanItemSchema>;
export type SavingPlanResponseDto = z.infer<typeof SavingPlanResponseSchema>;
export type BackendSavingPlanProgressResponseDto = z.infer<typeof BackendSavingPlanProgressResponseSchema>;
export type SavingPlanProgressResponseDto = z.infer<typeof SavingPlanProgressResponseSchema>;
export type BackendSavingPlanMonthlyProgressItemDto = z.infer<typeof BackendSavingPlanMonthlyProgressItemSchema>;
export type BackendSavingPlanMonthlyProgressResponseDto = z.infer<typeof BackendSavingPlanMonthlyProgressResponseSchema>;
export type SavingPlanMonthlyProgressItemDto = z.infer<typeof SavingPlanMonthlyProgressItemSchema>;
export type SavingPlanMonthlyProgressResponseDto = z.infer<typeof SavingPlanMonthlyProgressResponseSchema>;
