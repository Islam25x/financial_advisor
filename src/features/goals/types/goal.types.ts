import { z } from "zod";

export const GoalDurationUnitSchema = z.enum(["Months", "Years"]);

export const GoalSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  targetAmount: z.number().nonnegative(),
  currentAmount: z.number().nonnegative(),
  progressPercentage: z.number().nonnegative().max(100).optional(),
  durationValue: z.number().nonnegative(),
  durationUnit: GoalDurationUnitSchema,
  monthlyAmount: z.number().nonnegative(),
});

export const GoalListSchema = z.array(GoalSchema);

export const CreateGoalInputSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  targetAmount: z.number().positive(),
  durationUnit: GoalDurationUnitSchema,
  durationValue: z.number().positive().optional(),
  monthlyAmount: z.number().positive().optional(),
}).refine((data) => {
  const hasDuration = data.durationValue !== undefined;
  const hasMonthly = data.monthlyAmount !== undefined;

  return (hasDuration && !hasMonthly) || (!hasDuration && hasMonthly);
}, {
  message: "Provide either durationValue OR monthlyAmount (not both)",
});

export type Goal = z.infer<typeof GoalSchema>;
export type GoalDurationUnit = z.infer<typeof GoalDurationUnitSchema>;
export type CreateGoalInput = z.infer<typeof CreateGoalInputSchema>;

export type GoalHistoryEntry = {
  id: string;
  amount: number;
  occurredAt: string;
};

export type GoalHistoryPage = {
  items: GoalHistoryEntry[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
};

export type CreateGoalFormInput = {
  title: string;
  description: string;
  targetAmount: number;
  durationValue?: number;
  monthlyAmount?: number;
};
