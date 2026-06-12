import { useState } from "react";
import { Send } from "lucide-react";
import { useAiChat } from "../hooks/useAiChat";
import { Button, Card, Input, Text } from "../../../shared/ui";

const AI = () => {
  const [input, setInput] = useState("");
  const { messages, isSending, sendMessage } = useAiChat();

  const handleSendMessage = async () => {
    const userMessage = input.trim();

    if (!userMessage || isSending) {
      return;
    }

    setInput("");

    try {
      await sendMessage(userMessage);
    } catch {
      return;
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (e) => {
    if (e.key === "Enter") {
      void handleSendMessage();
    }
  };

  return (
    <section id="AI" className="max-w-3xl mx-auto">
      <Card variant="outline" padding="sm" className="shadow-md h-[550px] flex flex-col p-0 rounded-lg">
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <Text as="h2" variant="subtitle" weight="bold" className="text-gray-800">
            Chat Agent
          </Text>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[75%] px-4 py-2 rounded-lg ${message.role === "assistant"
                ? "bg-gray-100 text-gray-800 self-start"
                : "bg-primary text-white self-end ml-auto"
                }`}
            >
              {message.content}
            </div>
          ))}
          {isSending && (
            <Text variant="body" className="text-gray-400">
              AI is typing...
            </Text>
          )}
        </div>

        <div className="border-t border-gray-200 p-3 flex items-center gap-2 bg-gray-50 rounded-b-lg">
          <Input
            type="text"
            placeholder="Type your message..."
            className="flex-1 h-11"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
          />
          <Button
            onClick={() => void handleSendMessage()}
            variant="primary"
            size="sm"
            disabled={isSending}
            shape="circle"
            className="p-0"
          >
            <Send size={18} strokeWidth={1.75} />
          </Button>
        </div>
      </Card>
    </section>
  );
};

export default AI;
