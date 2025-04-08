
import React from "react";
import { FileText } from "lucide-react";
import { Message, User } from "@/types";
import MessageItem from "./MessageItem";

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
  getUser: (userId: string) => User | undefined;
  formatDate: (date: string) => string;
  getInitials: (name: string) => string;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  getUser,
  formatDate,
  getInitials
}) => {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">No messages yet</p>
          <p className="text-xs text-muted-foreground">
            Send a message to start the conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto mb-4 space-y-4">
      {messages.map((message) => {
        const messageUser = getUser(message.userId);
        const isCurrentUser = message.userId === currentUserId;
        
        return (
          <MessageItem
            key={message.id}
            message={message}
            isCurrentUser={isCurrentUser}
            messageUser={messageUser}
            formatDate={formatDate}
            getInitials={getInitials}
          />
        );
      })}
    </div>
  );
};

export default MessageList;
