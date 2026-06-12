import { z } from "zod";

export const ParsedTransactionSchema = z.object({
  amount: z.number().finite(),
  currency: z.string().optional(),
  merchant: z.string().optional(),
  category: z.string().min(1),
  transaction_type: z.string().optional(),
  date: z.string().optional(),
  description: z.string().min(1),
});

export type ParsedTransaction = z.infer<typeof ParsedTransactionSchema>;

export function parseParsedTransaction(payload: unknown): ParsedTransaction {
  return ParsedTransactionSchema.parse(payload);
}
