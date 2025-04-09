import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertCircle, ArrowLeft, Clock, FileText, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { mockTickets, mockUsers } from "@/data/mockData";
import TicketHeader from "@/components/tickets/TicketHeader";
import TicketInfo from "@/components/tickets/TicketInfo";
import ConversationCard from "@/components/tickets/ConversationCard";
import { Ticket, Message, User, Attachment } from "@/types";

const AdminTicketDetail = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [ticketUser, setTicketUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [admins, setAdmins] = useState<User[]>([]);
  const channelRef = useRef<any>(null);
  const ticketChannelRef = useRef<any>(null);

  // Fetch ticket data
  useEffect(() => {
    const fetchTicketData = async () => {
      if (!ticketId || !user) return;
      
      try {
        setIsLoading(true);
        
        // Fetch ticket data
        const { data: ticketData, error: ticketError } = await supabase
          .from("tickets")
          .select("*")
          .eq("id", ticketId)
          .single();
          
        if (ticketError) {
          // Fall back to mock data
          const mockTicket = mockTickets.find(t => t.id === ticketId);
          if (mockTicket) {
            setTicket(mockTicket);
            const mockTicketUser = mockUsers.find(u => u.id === mockTicket.userId);
            if (mockTicketUser) setTicketUser(mockTicketUser);
          }
        } else {
          setTicket({
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
          });
          
          // Fetch user data
          const { data: userData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", ticketData.user_id)
            .single();
            
          if (userData) {
            setTicketUser({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              createdAt: userData.created_at,
              isVerified: userData.is_verified || false,
              isActive: true,
            });
          }
        }
        
        // Fetch messages
        const { data: messagesData } = await supabase
          .from("messages")
          .select("*")
          .eq("ticket_id", ticketId)
          .order("created_at", { ascending: true });
          
        if (messagesData) {
          setMessages(messagesData.map(msg => ({
            id: msg.id,
            content: msg.content,
            createdAt: msg.created_at,
            ticketId: msg.ticket_id,
            userId: msg.user_id,
            isAdminMessage: msg.is_admin_message || false,
          })));
        }
        
        // Fetch admins
        const { data: adminsData } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "admin");
          
        if (adminsData) {
          setAdmins(adminsData.map(admin => ({
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            createdAt: admin.created_at,
            isVerified: admin.is_verified || false,
            isActive: true,
          })));
        }
        
      } catch (error) {
        console.error("Error fetching ticket data:", error);
        toast({
          title: "Error",
          description: "Failed to load ticket data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTicketData();
    
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      if (ticketChannelRef.current) supabase.removeChannel(ticketChannelRef.current);
    };
  }, [ticketId, user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!ticketId) return;
    
    // Messages subscription
    channelRef.current = supabase
      .channel('ticket-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `ticket_id=eq.${ticketId}`
      }, (payload) => {
        const newMessage = payload.new;
        setMessages(prev => [...prev, {
          id: newMessage.id,
          content: newMessage.content,
          createdAt: newMessage.created_at,
          ticketId: newMessage.ticket_id,
          userId: newMessage.user_id,
          isAdminMessage: newMessage.is_admin_message || false,
        }]);
      })
      .subscribe();
      
    // Ticket updates subscription
    ticketChannelRef.current = supabase
      .channel('ticket-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tickets',
        filter: `id=eq.${ticketId}`
      }, (payload) => {
        const updatedTicket = payload.new;
        setTicket(prev => prev ? {
          ...prev,
          status: updatedTicket.status,
          priority: updatedTicket.priority,
          assignedToId: updatedTicket.assigned_to_id,
          updatedAt: updatedTicket.updated_at,
        } : null);
      })
      .subscribe();
      
  }, [ticketId]);

  const handleStatusChange = async (status: 'open' | 'in-progress' | 'resolved' | 'closed') => {
    if (!ticket) return;
    
    setIsSavingStatus(true);
    try {
      const { error } = await supabase
        .from("tickets")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", ticket.id);
        
      if (error) throw error;
      
      toast({
        title: "Status updated",
        description: `Ticket status changed to ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsSavingStatus(false);
    }
  };
  
  const handleAssignToChange = async (adminId: string) => {
    if (!ticket) return;
    
    setIsAssigning(true);
    try {
      const { error } = await supabase
        .from("tickets")
        .update({ 
          assigned_to_id: adminId === "unassigned" ? null : adminId,
          updated_at: new Date().toISOString()
        })
        .eq("id", ticket.id);
        
      if (error) throw error;
      
      toast({
        title: "Assignment updated",
        description: adminId === "unassigned" ? "Ticket unassigned" : "Ticket assigned",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleSendMessage = async (content: string, files?: File[]) => {
    if (!content.trim() || !user || !ticket) return;
    
    setIsSending(true);
    try {
      const { data: message, error } = await supabase
        .from("messages")
        .insert({
          content,
          ticket_id: ticketId,
          user_id: user.id,
          is_admin_message: true,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Handle file uploads if needed
      
      toast({
        title: "Message sent",
        description: "Your response has been sent",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getUserById = (userId: string) => {
    if (ticketUser?.id === userId) return ticketUser;
    const admin = admins.find(a => a.id === userId);
    if (admin) return admin;
    return {
      id: userId,
      name: "Unknown User",
      email: "",
      role: "user" as const,
      createdAt: new Date().toISOString(),
      isVerified: false,
      isActive: true,
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Ticket Not Found</h2>
        <Button onClick={() => navigate("/admin/inbox")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inbox
        </Button>
      </div>
    );
  }

  const AdminPanel = () => (
    <Card>
      <CardHeader>
        <CardTitle>Admin Actions</CardTitle>
        <CardDescription>Manage ticket status and assignments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select
            value={ticket.status}
            onValueChange={handleStatusChange}
            disabled={isSavingStatus}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Assign To</label>
          <Select
            value={ticket.assignedToId || "unassigned"}
            onValueChange={handleAssignToChange}
            disabled={isAssigning}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select admin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {admins.map(admin => (
                <SelectItem key={admin.id} value={admin.id}>
                  {admin.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-2">
          <h4 className="text-sm font-medium">User Information</h4>
          <div className="rounded-md bg-muted p-3">
            <div className="flex items-center gap-2 mb-2">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <span>{ticketUser?.name || "Unknown User"}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>{ticketUser?.email || "No email"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Joined: {formatDate(ticketUser?.createdAt || "")}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          View User Profile
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-6">
      <TicketHeader ticket={ticket} />
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <TicketInfo 
            ticket={ticket} 
            ticketUser={ticketUser} 
            formatDate={formatDate} 
          />
          
          <Tabs defaultValue="conversation">
            <TabsList>
              <TabsTrigger value="conversation">Conversation</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="conversation" className="mt-4">
              <ConversationCard
                messages={messages}
                currentUserId={user?.id}
                getUser={getUserById}
                formatDate={formatDate}
                getInitials={getInitials}
                onSendMessage={handleSendMessage}
                isSending={isSending}
                attachments={attachments}
              />
            </TabsContent>
            
            <TabsContent value="attachments" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Attachments</CardTitle>
                </CardHeader>
                <CardContent>
                  {attachments.length > 0 ? (
                    <div className="space-y-2">
                      {attachments.map(attachment => (
                        <div key={attachment.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            <span>{attachment.filename}</span>
                          </div>
                          <Button variant="outline" size="sm">Download</Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No attachments found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Ticket History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-1 bg-muted rounded relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Ticket created</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(ticket.createdAt)} by {ticketUser?.name || "Unknown User"}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <AdminPanel />
        </div>
      </div>
    </div>
  );
};

export default AdminTicketDetail;