
import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Message, User } from "@/types";

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  messageUser: User | undefined;
  formatDate: (date: string) => string;
  getInitials: (name: string) => string;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isCurrentUser,
  messageUser,
  formatDate,
  getInitials
}) => {
  return (
    <div
      className={cn(
        "flex",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-lg p-3",
          isCurrentUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        <div className="flex items-center space-x-2 mb-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className={cn(
              "text-xs",
              isCurrentUser
                ? "bg-primary-foreground text-primary"
                : "bg-background text-foreground"
            )}>
              {messageUser ? getInitials(messageUser.name) : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="text-xs font-medium">
            {messageUser?.name} {message.isAdminMessage && "(Support)"}
          </div>
        </div>
        <div className="text-sm">{message.content}</div>
        <div className={cn(
          "text-xs mt-1 text-right",
          isCurrentUser ? "text-primary-foreground/80" : "text-muted-foreground"
        )}>
          {formatDate(message.createdAt)}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
