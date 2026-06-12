import { z } from "zod";
import { ParsedTransactionSchema } from "./parsed-transaction.schema";

export const TransactionSourceSchema = z.enum(["Manual", "OCR", "Chat", "Speech","Bill"]);

export const TransactionSchema = z.object({
  id: z.string().min(1),
  item: z.string().min(1).nullable().optional(),
  amount: z.number().finite(),
  categoryId: z.string().min(1).nullable().optional(),
  category: z.string().min(1),
  description: z.string(),
  merchant: z.string().nullable().optional(),
  date: z.string().optional(),
  type: z.enum(["Income", "Expense"]),
  source: TransactionSourceSchema.nullable().optional(),
  hasReceipt: z.boolean(),
  receiptImageUrl: z.string().min(1).nullable(),
  method: z.enum(["Speech", "receipt"]).optional(),
});

export const TransactionListSchema = z.array(TransactionSchema);
export const ParsedTransactionForLedgerSchema = ParsedTransactionSchema;

export type Transaction = z.infer<typeof TransactionSchema>;
