import { z } from "zod";

export const SavingPlanDurationSchema = z.union([
  z.literal(3),
  z.literal(6),
  z.literal(12),
]);

export const SavingPlanTypeSchema = z.enum(["Easy", "Balanced", "Aggressive"]);

export const SavingPlanFormStateSchema = z
  .object({
    months: SavingPlanDurationSchema.nullable(),
    planType: SavingPlanTypeSchema.nullable(),
    targetMonthlySaving: z.string(),
  })
  .superRefine((value, context) => {
    if (!value.months) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["months"],
        message: "Duration is required.",
      });
    }

    if (!value.planType) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["planType"],
        message: "Plan type is required.",
      });
    }

    const normalizedTarget = value.targetMonthlySaving.trim().replace(/,/g, "");

    if (!normalizedTarget) {
      return;
    }

    const targetMonthlySaving = Number(normalizedTarget);

    if (!Number.isFinite(targetMonthlySaving) || targetMonthlySaving <= 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["targetMonthlySaving"],
        message: "Target monthly saving must be greater than zero.",
      });
    }
  });

export const SavingPlanFormInputSchema = z.object({
  months: SavingPlanDurationSchema,
  planType: SavingPlanTypeSchema,
  targetMonthlySaving: z.number().positive().optional(),
});

export type SavingPlanDuration = z.infer<typeof SavingPlanDurationSchema>;
export type SavingPlanType = z.infer<typeof SavingPlanTypeSchema>;
export type SavingPlanFormInput = z.infer<typeof SavingPlanFormInputSchema>;

export type SavingPlanFormState = z.infer<typeof SavingPlanFormStateSchema>;

export type SavingPlanFormErrors = Partial<Record<keyof SavingPlanFormState, string>>;

export type SavingPlanProgressStatusVariant = "success" | "warning" | "danger" | "info";

export type SavingPlanCategoryProgressDto = {
  categoryId: string | null;
  categoryName: string;
  recommendedBudget: number;
  actualSpent: number;
  difference: number;
  status: string;
};

export type SavingPlanCurrentProgressDto = {
  year: number;
  month: number;
  recommendedMonthlySaving: number;
  actualIncome: number;
  actualExpenses: number;
  actualSaving: number;
  difference: number;
  progressPercentage: number;
  status: string | number;
  summary: string;
  categoryProgress: SavingPlanCategoryProgressDto[];
};

export type SavingPlanCategoryProgress = {
  categoryId: string | null;
  categoryName: string;
  recommendedBudget: number;
  actualSpent: number;
  difference: number;
  status: string;
};

export type SavingPlanCurrentProgress = {
  year: number;
  month: number;
  monthLabel: string;
  recommendedMonthlySaving: number;
  actualIncome: number;
  actualExpenses: number;
  actualSaving: number;
  difference: number;
  progressPercentage: number;
  status: string;
  statusVariant: SavingPlanProgressStatusVariant;
  summary: string;
  categoryProgress: SavingPlanCategoryProgress[];
};

export type SavingPlanMonthlyProgressPoint = {
  year: number;
  month: number;
  label: string;
  actualProgress: number;
  recommendedProgress: number;
  actualSaving: number;
  recommendedMonthlySaving: number;
  difference: number;
  status: string;
};
