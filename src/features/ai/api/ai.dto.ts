import { z } from "zod";
export type {
  ChatDto,
  ChatMessageDto,
  SendChatMessageDto,
  SendChatMessageResponseDto,
} from "./chat.dto";
export {
  CreateTransactionsFromSpeechResponseSchema,
  ParseTransactionsFromSpeechRequestSchema,
  type CreateTransactionsFromSpeechResponseDto,
  type ParseTransactionsFromSpeechRequestDto,
} from "./speech.dto";
export {
  VoiceToTextResponseSchema,
  type VoiceToTextRequestDto,
  type VoiceToTextResponse,
  type VoiceToTextResponseDto,
} from "./voice.dto";
export type {
  ReceiptOcrRequestDto,
  ReceiptOcrResponseDto,
} from "./ocr.dto";
export const ReceiptOcrItemSchema = z.object({
  message: z.string().optional(),
  name: z.string().optional(),
  line_total: z.number().finite().optional(),
  unit_price: z.number().finite().optional(),
  quantity: z.number().finite().optional(),
});

export const ReceiptOcrResponseSchema = z.object({
  message: z.string().optional(),
  items: z.array(ReceiptOcrItemSchema),
  merchant: z.string().optional(),
  issued_at: z.string().optional(),
});

export type ReceiptOcrItem = z.infer<typeof ReceiptOcrItemSchema>;
export type ReceiptOcrResponse = z.infer<typeof ReceiptOcrResponseSchema>;
