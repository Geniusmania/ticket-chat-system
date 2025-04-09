
import React, { useState, useEffect, useRef } from "react";
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
import { supabase } from "@/integrations/supabase/client";

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
  const [typing, setTyping] = useState<{userId: string, name: string} | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);
  
  useEffect(() => {
    // Only set up typing indicator channel if we have a current user and at least one message
    // to determine the ticket ID
    if (!currentUserId || messages.length === 0) return;

    const ticketId = messages[0]?.ticketId;
    if (!ticketId) return;
    
    const channel = supabase.channel(`typing-${ticketId}`);
    
    channel.on('broadcast', { event: 'typing' }, (payload) => {
      // If someone else is typing
      if (payload.payload.userId !== currentUserId) {
        setTyping({
          userId: payload.payload.userId,
          name: payload.payload.name
        });
        
        // Clear typing indicator after 3 seconds
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
          setTyping(null);
        }, 3000);
      }
    })
    .subscribe();
    
    // Store the channel reference
    channelRef.current = channel;
      
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [currentUserId, messages]);

  const handleTyping = () => {
    // Don't send typing notifications if we don't have a current user or ticket
    if (!currentUserId || messages.length === 0) return;
    
    const ticketId = messages[0]?.ticketId;
    if (!ticketId) return;
    
    const user = getUser(currentUserId);
    if (!user) return;
    
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          userId: currentUserId,
          name: user.name
        }
      });
    }
  };

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
              typing={typing}
            />
            
            <MessageInputBox 
              onSend={onSendMessage}
              disabled={isSending}
              onTyping={handleTyping}
            />
          </TabsContent>
          
          <TabsContent value="attachments">
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
