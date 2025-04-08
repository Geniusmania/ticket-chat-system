
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Clock,
  Calendar,
  Tag,
  AlertTriangle,
  Send,
  ArrowLeft,
  Paperclip,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { mockTickets, mockMessages, mockUsers } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const TicketDetail = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState(mockMessages.filter(msg => msg.ticketId === ticketId));
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const ticket = mockTickets.find(t => t.id === ticketId);

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Ticket not found</h2>
        <p className="text-muted-foreground mb-6">The ticket you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
      </div>
    );
  }

  const getUser = (userId: string) => {
    return mockUsers.find(u => u.id === userId);
  };

  const ticketUser = getUser(ticket.userId);
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    
    setIsSending(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newMsg = {
        id: `msg-${Date.now()}`,
        content: newMessage,
        createdAt: new Date().toISOString(),
        ticketId: ticketId as string,
        userId: user.id,
        isAdminMessage: user.role === "admin",
      };
      
      setMessages([...messages, newMsg]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Left column - Ticket details */}
      <div className="w-full md:w-1/3 space-y-4">
        <Button
          variant="outline"
          size="sm"
          className="mb-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center">
                  {ticket.title}
                </CardTitle>
                <CardDescription>
                  Ticket #{ticket.id.split("-")[1]}
                </CardDescription>
              </div>
              <div className={`ticket-status-badge ticket-status-${ticket.status}`}>
                {ticket.status.replace("-", " ")}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Description:</div>
                <div>{ticket.description}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                  <div>
                    <div className="text-muted-foreground">Submitted</div>
                    <div>{formatDate(ticket.createdAt)}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                  <div>
                    <div className="text-muted-foreground">Last Updated</div>
                    <div>{formatDate(ticket.updatedAt)}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Tag className="h-4 w-4 text-muted-foreground mr-2" />
                  <div>
                    <div className="text-muted-foreground">Category</div>
                    <div className="capitalize">{ticket.category}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground mr-2" />
                  <div>
                    <div className="text-muted-foreground">Priority</div>
                    <div className={`text-priority-${ticket.priority} capitalize`}>
                      {ticket.priority}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4 flex items-center">
                <div className="text-sm">
                  <div className="text-muted-foreground">Submitted by:</div>
                  <div className="font-medium">{ticketUser?.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {ticketUser?.email}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right column - Chat */}
      <div className="flex-1">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
            <CardDescription>
              Messages and updates related to this ticket
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {messages.length > 0 ? (
                messages.map((message) => {
                  const messageUser = getUser(message.userId);
                  const isCurrentUser = message.userId === user?.id;
                  
                  return (
                    <div
                      key={message.id}
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
                })
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-2">
                    <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">No messages yet</p>
                    <p className="text-xs text-muted-foreground">
                      Send a message to start the conversation
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <MessageInput 
              onSend={handleSendMessage}
              disabled={isSending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled = false }) => {
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

export default TicketDetail;
