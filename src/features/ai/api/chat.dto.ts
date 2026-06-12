import type { TransactionResponseDto } from "../../transactions/api/transaction.dto";
import type { ChatMessageRole } from "../types/ai.types";

export interface ChatMessageDto {
  role: ChatMessageRole;
  content: string;
  createdAt: string;
}

export interface ChatDto {
  title: string;
  messages: ChatMessageDto[];
}

export interface SendChatMessageDto {
  message: string;
  occurredAt?: string;
}

export interface SendChatMessageResponseDto {
  sessionId: string;
  reply: string;
  transactions: TransactionResponseDto[];
}
