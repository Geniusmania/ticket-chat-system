
import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MessageList from "./MessageList";
import MessageInputBox from "./MessageInputBox";
import AttachmentsList from "./AttachmentsList";
import { Message, User, Attachment } from "@/types";

interface ConversationCardProps {
  messages: Message[];
  currentUserId?: string;
  getUser: (userId: string) => User | undefined;
  formatDate: (date: string) => string;
  getInitials: (name: string) => string;
  onSendMessage: (message: string, attachments?: File[]) => void;
  isSending: boolean;
  attachments?: Attachment[];
}

const ConversationCard: React.FC<ConversationCardProps> = ({
  messages,
  currentUserId,
  getUser,
  formatDate,
  getInitials,
  onSendMessage,
  isSending,
  attachments = []
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
        <Tabs defaultValue="messages" className="flex-1 flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="attachments">
              Attachments {attachments.length > 0 && `(${attachments.length})`}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="messages" className="flex-1 flex flex-col">
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
          </TabsContent>
          
          <TabsContent value="attachments" className="space-y-4">
            <AttachmentsList 
              attachments={attachments}
              messages={messages}
              getUser={getUser}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ConversationCard;
