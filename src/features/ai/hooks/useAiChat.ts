import { useCallback } from "react";
import { useChatMessages } from "./useChatMessages";
import { useSendChatMessage } from "./useSendChatMessage";

export function useAiChat() {
  const { data: conversation } = useChatMessages();
  const sendMessageMutation = useSendChatMessage();

  const sendMessage = useCallback(
    async (message: string) => {
      return sendMessageMutation.mutateAsync({ message });
    },
    [sendMessageMutation],
  );

  return {
    title: conversation?.title ?? "Chat Assistant",
    messages: conversation?.messages ?? [],
    isSending: sendMessageMutation.isPending,
    sendMessage,
  };
}
