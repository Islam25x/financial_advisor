import { useQuery } from "@tanstack/react-query";
import { getChatMessagesApi } from "../api/ChatBot.api";
import {
  CHAT_MESSAGES_QUERY_KEY,
  normalizeChatConversation,
} from "../utils/chat-messages";

export function useChatMessages() {
  return useQuery({
    queryKey: CHAT_MESSAGES_QUERY_KEY,
    queryFn: ({ signal }) => getChatMessagesApi({ signal }),
    select: normalizeChatConversation,
  });
}
