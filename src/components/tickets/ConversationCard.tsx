
import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import MessageList from "./MessageList";
import MessageInputBox from "./MessageInputBox";
import { Message, User } from "@/types";

interface ConversationCardProps {
  messages: Message[];
  currentUserId?: string;
  getUser: (userId: string) => User | undefined;
  formatDate: (date: string) => string;
  getInitials: (name: string) => string;
  onSendMessage: (message: string) => void;
  isSending: boolean;
}

const ConversationCard: React.FC<ConversationCardProps> = ({
  messages,
  currentUserId,
  getUser,
  formatDate,
  getInitials,
  onSendMessage,
  isSending
}) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Conversation</CardTitle>
        <CardDescription>
          Messages and updates related to this ticket
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          getUser={getUser}
          formatDate={formatDate}
          getInitials={getInitials}
        />
        
        <MessageInputBox 
          onSend={onSendMessage}
          disabled={isSending}
        />
      </CardContent>
    </Card>
  );
};

export default ConversationCard;
