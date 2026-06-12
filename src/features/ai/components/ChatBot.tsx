import { X, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAiChat } from "../hooks/useAiChat";
import { Button, Input, Text } from "../../../shared/ui";

interface ChatBotProps {
  setActive: (value: boolean) => void;
  setHideIcon: (value: boolean) => void;
}

function ChatBot({ setActive, setHideIcon }: ChatBotProps) {
  const [input, setInput] = useState("");
  const { title, messages, isSending, sendMessage } = useAiChat();

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      bottomRef.current?.scrollIntoView({
        behavior,
        block: "end",
      });
    },
    [],
  );


  const handleSend = async () => {
    const userMessage = input.trim();

    if (!userMessage) {
      return;
    }

    setInput("");

    try {
      await sendMessage(userMessage);
    } catch {
      return;
    }
  };

  const handleClose = () => {
    setActive(false);
    setHideIcon(true);
    setTimeout(() => setHideIcon(false), 400);
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      scrollToBottom(messages.length > 0 ? "smooth" : "auto");
    });

    return () => cancelAnimationFrame(frame);
  }, [messages, isSending, scrollToBottom]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.9 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="w-[500px] h-[550px] bg-white rounded-2xl shadow-2xl border border-primary/40 overflow-hidden flex flex-col"
    >
      <div className="bg-primary text-white p-4 font-semibold flex justify-between items-center">
        <Text as="span" variant="body" weight="bold" className="text-white">
          {title}
        </Text>
        <Button
          variant="ghost"
          size="sm"
          shape="circle"
          className="cursor-pointer text-white hover:text-primary-600"
          onClick={handleClose}
        >
          <X size={22} />
        </Button>
      </div>

      <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 text-gray-800">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <span
              className={`px-3 py-2 rounded-xl text-sm max-w-8/12 ${message.role === "user"
                ? "bg-primary text-white rounded-br-none"
                : "bg-gray-100 text-gray-800 rounded-bl-none"
                }`}
            >
              {message.content}
            </span>
          </div>
        ))}
        {isSending && (
          <Text variant="body" className="text-gray-400 text-sm">
            Bot is typing...
          </Text>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t p-3 flex items-center gap-2">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void handleSend()}
          placeholder="Type your message..."
          className="flex-1 p-2"
        />
        <Button
          onClick={() => void handleSend()}
          variant="primary"
          size="sm"
          disabled={isSending}
          shape="circle"
          className="p-0"
        >
          <Send size={18} />
        </Button>
      </div>
    </motion.div>
  );
}

export default ChatBot;
