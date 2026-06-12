import { z } from "zod";

export const ParseTransactionsFromSpeechRequestSchema = z.object({
  text: z.string().trim().min(1),
  occurredAt: z.string().trim().min(1).optional(),
});

export const CreateTransactionsFromSpeechResponseSchema = z.object({
  message: z.string(),
  count: z.number().int().nonnegative(),
});

export type ParseTransactionsFromSpeechRequestDto = z.infer<
  typeof ParseTransactionsFromSpeechRequestSchema
>;

export type CreateTransactionsFromSpeechResponseDto = z.infer<
  typeof CreateTransactionsFromSpeechResponseSchema
>;
