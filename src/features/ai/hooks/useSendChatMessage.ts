import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invalidateTransactionDomainQueries } from "../../../infrastructure/query/invalidation/transaction-invalidation";
import { sendChatMessageApi } from "../api/ChatBot.api";
import type {
  SendChatMessageDto,
  SendChatMessageResponseDto,
} from "../api/chat.dto";
import type {
  ChatConversation,
} from "../types/ai.types";
import {
  appendChatMessages,
  CHAT_CONNECTION_ERROR_FALLBACK,
  CHAT_MESSAGES_QUERY_KEY,
  CHAT_REPLY_FALLBACK,
  createOptimisticChatMessage,
} from "../utils/chat-messages";

type SendChatMutationContext = {
  previousChat?: ChatConversation;
};

export function useSendChatMessage() {
  const queryClient = useQueryClient();

  return useMutation<
    SendChatMessageResponseDto,
    Error,
    SendChatMessageDto,
    SendChatMutationContext
  >({
    mutationFn: (payload) => sendChatMessageApi(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({
        queryKey: CHAT_MESSAGES_QUERY_KEY,
      });

      const previousChat = queryClient.getQueryData<ChatConversation>(
        CHAT_MESSAGES_QUERY_KEY,
      );

      queryClient.setQueryData<ChatConversation>(
        CHAT_MESSAGES_QUERY_KEY,
        appendChatMessages(previousChat, [
          createOptimisticChatMessage("user", payload.message),
        ]),
      );

      return { previousChat };
    },
    onSuccess: async (response) => {
      queryClient.setQueryData<ChatConversation>(
        CHAT_MESSAGES_QUERY_KEY,
        (currentChat) =>
          appendChatMessages(currentChat, [
            createOptimisticChatMessage(
              "assistant",
              response.reply || CHAT_REPLY_FALLBACK,
            ),
          ]),
      );

      if (response.transactions.length > 0) {
        await invalidateTransactionDomainQueries(queryClient);
      }
    },
    onError: (_error, _payload, context) => {
      queryClient.setQueryData<ChatConversation>(
        CHAT_MESSAGES_QUERY_KEY,
        (currentChat) =>
          appendChatMessages(currentChat ?? context?.previousChat, [
            createOptimisticChatMessage(
              "assistant",
              CHAT_CONNECTION_ERROR_FALLBACK,
            ),
          ]),
      );
    },
  });
}
