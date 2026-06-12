import { requestJson } from "../../../infrastructure/api/http";
import { getCurrentTransactionTimestamp } from "../../transactions/utils/transaction-dates";
import type {
  ChatDto,
  SendChatMessageDto,
  SendChatMessageResponseDto,
} from "./chat.dto";

export async function getChatMessagesApi(
    options?: { signal?: AbortSignal },
): Promise<ChatDto> {
    return requestJson<ChatDto>("/api/Chat", {
        method: "GET",
        signal: options?.signal,
        withAuth: true,
    });
}

export async function sendChatMessageApi(
    payload: SendChatMessageDto,
    options?: { signal?: AbortSignal },
): Promise<SendChatMessageResponseDto> {
    return requestJson<SendChatMessageResponseDto>("/api/Chat/send", {
        method: "POST",
        body: JSON.stringify({
            ...payload,
            occurredAt: payload.occurredAt ?? getCurrentTransactionTimestamp(),
        }),
        signal: options?.signal,
        withAuth: true,
    });
}
