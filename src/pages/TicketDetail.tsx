
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockTickets, mockMessages, mockUsers } from "@/data/mockData";

// Import the refactored components
import TicketHeader from "@/components/tickets/TicketHeader";
import TicketInfo from "@/components/tickets/TicketInfo";
import ConversationCard from "@/components/tickets/ConversationCard";

const TicketDetail = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState(mockMessages.filter(msg => msg.ticketId === ticketId));
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

  const handleSendMessage = async (newMessage: string) => {
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
        <TicketHeader ticket={ticket} />
        <TicketInfo 
          ticket={ticket} 
          ticketUser={ticketUser} 
          formatDate={formatDate} 
        />
      </div>

      {/* Right column - Chat */}
      <div className="flex-1">
        <ConversationCard
          messages={messages}
          currentUserId={user?.id}
          getUser={getUser}
          formatDate={formatDate}
          getInitials={getInitials}
          onSendMessage={handleSendMessage}
          isSending={isSending}
        />
      </div>
    </div>
  );
};

export default TicketDetail;
