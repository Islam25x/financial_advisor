import type {
  ChatDto,
  ChatMessageDto,
} from "../api/chat.dto";
import { queryKeys } from "../../../infrastructure/query/query-keys";
import type { ChatConversation, ChatMessage } from "../types/ai.types";

export const CHAT_MESSAGES_QUERY_KEY = queryKeys.ai.chatMessages;

const DEFAULT_ASSISTANT_MESSAGE = "👋 Hello there! How can I help you today?";
export const CHAT_REPLY_FALLBACK = "Sorry, I didn't get that.";
export const CHAT_CONNECTION_ERROR_FALLBACK = "⚠️ Error connecting to the server.";

function createMessageId(
  role: ChatMessageDto["role"],
  createdAt: string,
  content: string,
  occurrence: number,
): string {
  return `${role}:${createdAt}:${content}:${occurrence}`;
}

function mapChatMessages(messages: ChatMessageDto[]): ChatMessage[] {
  const occurrenceMap = new Map<string, number>();

  return messages.map((message) => {
    const normalizedCreatedAt = message.createdAt || new Date(0).toISOString();
    const occurrenceKey = `${message.role}:${normalizedCreatedAt}:${message.content}`;
    const occurrence = occurrenceMap.get(occurrenceKey) ?? 0;
    occurrenceMap.set(occurrenceKey, occurrence + 1);

    return {
      id: createMessageId(
        message.role,
        normalizedCreatedAt,
        message.content,
        occurrence,
      ),
      role: message.role,
      content: message.content,
      createdAt: normalizedCreatedAt,
    };
  });
}

function createDefaultAssistantMessage(): ChatMessage {
  return {
    id: "assistant:default-greeting",
    role: "assistant",
    content: DEFAULT_ASSISTANT_MESSAGE,
    createdAt: new Date(0).toISOString(),
  };
}

export function createOptimisticChatMessage(
  role: ChatMessage["role"],
  content: string,
): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

export function normalizeChatConversation(
  data: ChatDto | ChatConversation | undefined,
): ChatConversation {
  const title = data?.title ?? "Chat Assistant";

  if (!data?.messages?.length) {
    return {
      title,
      messages: [createDefaultAssistantMessage()],
    };
  }

  const normalizedMessages =
    "id" in data.messages[0]
      ? (data.messages as ChatMessage[])
      : mapChatMessages(data.messages as ChatMessageDto[]);

  return {
    title,
    messages: normalizedMessages,
  };
}

export function appendChatMessages(
  conversation: ChatConversation | undefined,
  nextMessages: ChatMessage[],
): ChatConversation {
  const currentConversation = normalizeChatConversation(conversation);

  return {
    title: currentConversation.title,
    messages: [...currentConversation.messages, ...nextMessages],
  };
}
