
import React, { useState } from "react";
import { Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputBoxProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const MessageInputBox: React.FC<MessageInputBoxProps> = ({ 
  onSend, 
  disabled = false 
}) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border rounded-lg flex items-end">
      <Textarea
        placeholder="Write a message..."
        className="border-0 flex-1 focus-visible:ring-0 rounded-tr-none rounded-br-none resize-none"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <div className="p-2 flex">
        <Button
          size="icon"
          variant="ghost"
          type="button"
          className="rounded-full h-8 w-8 mr-1"
          disabled={disabled}
          title="Attach file (coming soon)"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          type="button"
          className="rounded-full h-8 w-8"
          onClick={handleSend}
          disabled={!message.trim() || disabled}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInputBox;
