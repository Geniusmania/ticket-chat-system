
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { mockTickets, mockMessages, mockUsers } from "@/data/mockData";

// Import the refactored components
import TicketHeader from "@/components/tickets/TicketHeader";
import TicketInfo from "@/components/tickets/TicketInfo";
import ConversationCard from "@/components/tickets/ConversationCard";
import { Ticket, Message, User, Attachment } from "@/types";

const TicketDetail = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [ticketUser, setTicketUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchTicketData = async () => {
      if (!ticketId) return;
      
      try {
        // Fetch ticket details
        const { data: ticketData, error: ticketError } = await supabase
          .from("tickets")
          .select("*")
          .eq("id", ticketId)
          .single();
        
        if (ticketError) {
          // Fall back to mock data if needed
          const mockTicket = mockTickets.find(t => t.id === ticketId);
          if (mockTicket) {
            setTicket(mockTicket);
            
            // Get mock user
            const mockUser = mockUsers.find(u => u.id === mockTicket.userId);
            if (mockUser) setTicketUser(mockUser);
            
            // Get mock messages
            const mockTicketMessages = mockMessages.filter(m => m.ticketId === ticketId);
            setMessages(mockTicketMessages);
          } else {
            throw new Error("Ticket not found");
          }
        } else {
          // Format the ticket data
          const formattedTicket: Ticket = {
            id: ticketData.id,
            title: ticketData.title,
            description: ticketData.description,
            status: ticketData.status,
            priority: ticketData.priority,
            category: ticketData.category,
            createdAt: ticketData.created_at,
            updatedAt: ticketData.updated_at,
            userId: ticketData.user_id,
            assignedToId: ticketData.assigned_to_id,
          };
          setTicket(formattedTicket);
          
          // Fetch ticket creator profile
          const { data: userData, error: userError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", ticketData.user_id)
            .single();
            
          if (!userError && userData) {
            const formattedUser: User = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              createdAt: userData.created_at,
              isVerified: userData.is_verified || false,
              isActive: true,
            };
            setTicketUser(formattedUser);
          }
          
          // Fetch messages
          const { data: messagesData, error: messagesError } = await supabase
            .from("messages")
            .select("*")
            .eq("ticket_id", ticketId)
            .order("created_at", { ascending: true });
            
          if (!messagesError && messagesData) {
            const formattedMessages: Message[] = messagesData.map(msg => ({
              id: msg.id,
              content: msg.content,
              createdAt: msg.created_at,
              ticketId: msg.ticket_id,
              userId: msg.user_id,
              isAdminMessage: msg.is_admin_message || false,
            }));
            setMessages(formattedMessages);
          }
          
          // Fetch attachments
          const { data: attachmentsData, error: attachmentsError } = await supabase
            .from("attachments")
            .select("*")
            .eq("ticket_id", ticketId);
            
          if (!attachmentsError && attachmentsData) {
            const formattedAttachments: Attachment[] = attachmentsData.map(att => ({
              id: att.id,
              filename: att.filename,
              path: att.path,
              ticketId: att.ticket_id,
              messageId: att.message_id,
              uploadedAt: att.uploaded_at,
              uploadedById: att.uploaded_by_id,
            }));
            setAttachments(formattedAttachments);
          }
        }
      } catch (error) {
        console.error("Error fetching ticket data:", error);
        toast({
          title: "Error",
          description: "Failed to load ticket data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicketData();
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('ticket-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `ticket_id=eq.${ticketId}`
        },
        async (payload) => {
          const newMessage = payload.new;
          
          // Format the new message
          const formattedMessage: Message = {
            id: newMessage.id,
            content: newMessage.content,
            createdAt: newMessage.created_at,
            ticketId: newMessage.ticket_id,
            userId: newMessage.user_id,
            isAdminMessage: newMessage.is_admin_message || false,
          };
          
          // Get user details if not available
          let messageUser = null;
          if (newMessage.is_admin_message) {
            // For admin messages, fetch the admin user if not the current user
            if (user?.id !== newMessage.user_id) {
              const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", newMessage.user_id)
                .single();
                
              if (data) {
                messageUser = {
                  id: data.id,
                  name: data.name,
                  role: data.role,
                  email: data.email,
                  createdAt: data.created_at,
                  isVerified: data.is_verified || false,
                };
              }
            }
          }
          
          setMessages(prev => [...prev, formattedMessage]);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId, user]);

  const getUser = (userId: string) => {
    if (ticketUser && userId === ticketUser.id) {
      return ticketUser;
    }
    
    // For admin users, we might need to fetch them
    const adminUser = mockUsers.find(u => u.id === userId && u.role === "admin");
    if (adminUser) {
      return adminUser;
    }
    
    // If all else fails, return a default user
    return {
      id: userId,
      name: "Unknown User",
      email: "unknown@example.com",
      role: "user" as const,
      createdAt: new Date().toISOString(),
      isVerified: false,
      isActive: true,
    };
  };
  
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

  const handleSendMessage = async (newMessage: string, attachedFiles?: File[]) => {
    if (!newMessage.trim() || !user || !ticket) return;
    
    setIsSending(true);
    
    try {
      // Create the message
      const { data: msgData, error: msgError } = await supabase
        .from("messages")
        .insert({
          content: newMessage,
          ticket_id: ticketId,
          user_id: user.id,
          is_admin_message: user.role === "admin",
        })
        .select()
        .single();
        
      if (msgError) throw msgError;
      
      // Upload attachments if any
      if (attachedFiles && attachedFiles.length > 0) {
        for (const file of attachedFiles) {
          const fileName = `${Date.now()}-${file.name}`;
          const filePath = `tickets/${ticketId}/${fileName}`;
          
          // Upload file to storage
          const { error: uploadError } = await supabase.storage
            .from("attachments")
            .upload(filePath, file);
            
          if (uploadError) {
            console.error("Error uploading file:", uploadError);
            continue;
          }
          
          // Save attachment metadata
          const { error: attachmentError } = await supabase
            .from("attachments")
            .insert({
              filename: file.name,
              path: filePath,
              ticket_id: ticketId,
              message_id: msgData.id,
              uploaded_by_id: user.id,
            });
            
          if (attachmentError) {
            console.error("Error saving attachment metadata:", attachmentError);
          }
        }
      }
      
      // Update ticket status if needed
      if (ticket.status === "open" && user.role === "admin") {
        const { error: updateError } = await supabase
          .from("tickets")
          .update({ status: "in-progress", updated_at: new Date().toISOString() })
          .eq("id", ticketId);
          
        if (updateError) {
          console.error("Error updating ticket status:", updateError);
        } else {
          // Update local state
          setTicket({
            ...ticket,
            status: "in-progress",
            updatedAt: new Date().toISOString(),
          });
        }
      }
      
      // Message will be added via the real-time subscription
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Ticket not found</h2>
        <p className="text-muted-foreground mb-6">The ticket you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/dashboard")}>Return to Dashboard</Button>
      </div>
    );
  }

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
          attachments={attachments}
        />
      </div>
    </div>
  );
};

export default TicketDetail;
