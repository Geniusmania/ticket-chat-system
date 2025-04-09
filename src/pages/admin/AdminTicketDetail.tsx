
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockTickets, mockUsers } from "@/data/mockData";
import { ArrowLeft, Clock, FileText, User as UserIcon, Loader2, AlertCircle } from "lucide-react";
import TicketHeader from "@/components/tickets/TicketHeader";
import TicketInfo from "@/components/tickets/TicketInfo";
import ConversationCard from "@/components/tickets/ConversationCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
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

  // Fetch ticket data, user data, and related messages
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
          console.error("Error fetching ticket:", ticketError);
          // Fall back to mock data
          const mockTicket = mockTickets.find(t => t.id === ticketId);
          if (mockTicket) {
            setTicket({
              id: mockTicket.id,
              title: mockTicket.title,
              description: mockTicket.description,
              status: mockTicket.status,
              priority: mockTicket.priority,
              category: mockTicket.category,
              createdAt: mockTicket.createdAt,
              updatedAt: mockTicket.updatedAt,
              userId: mockTicket.userId,
              assignedToId: mockTicket.assignedToId,
            });
            
            const mockTicketUser = mockUsers.find(u => u.id === mockTicket.userId);
            if (mockTicketUser) setTicketUser(mockTicketUser);
            
            const mockTicketMessages = mockUsers
              .filter(u => u.id && u.role === "user")
              .slice(0, 3)
              .map(u => ({
                id: `mock-${Math.random().toString(36).substring(2, 9)}`,
                content: "This is a mock message for testing purposes",
                createdAt: new Date().toISOString(),
                ticketId: ticketId,
                userId: u.id,
                isAdminMessage: false,
              }));
              
            setMessages(mockTicketMessages);
          } else {
            throw new Error("Ticket not found");
          }
        } else {
          // Format ticket data
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
          
          // Fetch ticket user data
          const { data: userData, error: userError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", ticketData.user_id)
            .single();
            
          if (!userError && userData) {
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
          } else {
            console.error("Error fetching messages:", messagesError);
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
        
        // Fetch admin users
        const { data: adminUsersData } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "admin");
          
        if (adminUsersData) {
          const formattedAdmins: User[] = adminUsersData.map(admin => ({
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            createdAt: admin.created_at,
            isVerified: admin.is_verified || false,
            isActive: true,
          }));
          setAdmins(formattedAdmins);
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
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('admin-ticket-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `ticket_id=eq.${ticketId}`
        },
        (payload) => {
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
          
          setMessages(prev => [...prev, formattedMessage]);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId, user]);

  const handleStatusChange = async (status: string) => {
    if (!ticket) return;
    
    setIsSavingStatus(true);
    try {
      const { error } = await supabase
        .from("tickets")
        .update({ 
          status: status as "open" | "in-progress" | "resolved" | "closed",
          updated_at: new Date().toISOString()
        })
        .eq("id", ticket.id);
        
      if (error) throw error;
      
      // Update local state
      setTicket({
        ...ticket,
        status: status as "open" | "in-progress" | "resolved" | "closed",
        updatedAt: new Date().toISOString()
      });
      
      toast({
        title: "Status updated",
        description: `Ticket status changed to ${status}`,
      });
      
      // Log the action
      await supabase.from("audit_logs").insert({
        user_id: user?.id,
        action: "update_status",
        entity_id: ticket.id,
        entity_type: "ticket",
        details: { old_status: ticket.status, new_status: status }
      });
      
    } catch (error) {
      console.error("Error updating ticket status:", error);
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
    } finally {
      setIsSavingStatus(false);
    }
  };
  
  const handleAssignToChange = async (userId: string) => {
    if (!ticket) return;
    
    setIsAssigning(true);
    try {
      const { error } = await supabase
        .from("tickets")
        .update({ 
          assigned_to_id: userId || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", ticket.id);
        
      if (error) throw error;
      
      // Update local state
      setTicket({
        ...ticket,
        assignedToId: userId || null,
        updatedAt: new Date().toISOString()
      });
      
      toast({
        title: "Assignment updated",
        description: userId ? "Ticket assigned successfully" : "Ticket unassigned",
      });
      
      // Log the action
      await supabase.from("audit_logs").insert({
        user_id: user?.id,
        action: "update_assignment",
        entity_id: ticket.id,
        entity_type: "ticket",
        details: { old_assignment: ticket.assignedToId, new_assignment: userId }
      });
      
    } catch (error) {
      console.error("Error updating ticket assignment:", error);
      toast({
        title: "Error",
        description: "Failed to update ticket assignment",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleSendMessage = async (content: string, attachedFiles?: File[]) => {
    if (!content.trim() || !user || !ticket) return;
    
    setIsSending(true);
    
    try {
      // Create the message
      const { data: msgData, error: msgError } = await supabase
        .from("messages")
        .insert({
          content,
          ticket_id: ticketId,
          user_id: user.id,
          is_admin_message: true,
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
      
      // Update ticket status to in-progress if it's open
      if (ticket.status === "open") {
        await handleStatusChange("in-progress");
      }
      
      // Log the action
      await supabase.from("audit_logs").insert({
        user_id: user.id,
        action: "send_message",
        entity_id: ticket.id,
        entity_type: "ticket",
        details: { message_id: msgData.id }
      });
      
      toast({
        title: "Message sent",
        description: "Your response has been sent to the user",
      });
      
      // The message will be added via the real-time subscription
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

  const getUserById = (userId: string) => {
    if (ticketUser && userId === ticketUser.id) {
      return ticketUser;
    }
    
    // For admin users
    const adminUser = admins.find(u => u.id === userId);
    if (adminUser) {
      return adminUser;
    }
    
    // Fall back to mock data
    const mockUser = mockUsers.find(u => u.id === userId);
    if (mockUser) {
      return mockUser;
    }
    
    // If all else fails
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading ticket details...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Ticket Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The ticket you're looking for doesn't exist or has been deleted.
        </p>
        <Button onClick={() => navigate("/admin/inbox")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inbox
        </Button>
      </div>
    );
  }

  const assignedAdmin = ticket.assignedToId 
    ? admins.find((u) => u.id === ticket.assignedToId) || 
      mockUsers.find((u) => u.id === ticket.assignedToId && u.role === "admin")
    : null;

  const AdminPanel = () => (
    <Card>
      <CardHeader>
        <CardTitle>Admin Actions</CardTitle>
        <CardDescription>
          Manage ticket status and assignments
        </CardDescription>
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
          {isSavingStatus && (
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              Saving...
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Assign To</label>
          <Select
            value={ticket.assignedToId || ""}
            onValueChange={handleAssignToChange}
            disabled={isAssigning}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select admin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unassigned</SelectItem>
              {admins.map((admin) => (
                <SelectItem key={admin.id} value={admin.id}>
                  {admin.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isAssigning && (
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              Updating assignment...
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-2">
          <h4 className="text-sm font-medium">User Information</h4>
          <div className="rounded-md bg-muted p-3">
            <div className="flex items-center gap-2 mb-2">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{ticketUser?.name || "Unknown User"}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{ticketUser?.email || "No email"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Joined: {formatDate(ticketUser?.createdAt || "")}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={() => navigate(`/admin/users?id=${ticketUser?.id}`)}>
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
          
          <Tabs defaultValue="conversation" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="conversation">Conversation</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="conversation" className="mt-0">
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
            
            <TabsContent value="attachments" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Attachments</CardTitle>
                  <CardDescription>
                    Files associated with this ticket
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {attachments.length > 0 ? (
                    <div className="space-y-2">
                      {attachments.map((attachment) => (
                        <div 
                          key={attachment.id}
                          className="flex items-center justify-between p-3 bg-card border rounded-lg"
                        >
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{attachment.filename}</span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={async () => {
                              try {
                                const { data, error } = await supabase.storage
                                  .from('attachments')
                                  .download(attachment.path);
                                
                                if (error) throw error;
                                
                                const url = URL.createObjectURL(data);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = attachment.filename;
                                document.body.appendChild(a);
                                a.click();
                                URL.revokeObjectURL(url);
                                document.body.removeChild(a);
                              } catch (error) {
                                console.error('Error downloading file:', error);
                                toast({
                                  title: "Download failed",
                                  description: "Unable to download the file",
                                  variant: "destructive"
                                });
                              }
                            }}
                          >
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No attachments found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Ticket History</CardTitle>
                  <CardDescription>
                    Timeline of changes to this ticket
                  </CardDescription>
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
                    
                    {messages.length > 0 && (
                      <div className="flex gap-4">
                        <div className="w-1 bg-muted rounded relative">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">First response</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(messages[0].createdAt)} by {getUserById(messages[0].userId).name}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {ticket.status !== "open" && (
                      <div className="flex gap-4">
                        <div className="w-1 bg-muted rounded relative">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Status updated to {ticket.status}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(ticket.updatedAt)}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {ticket.assignedToId && (
                      <div className="flex gap-4">
                        <div className="w-1 bg-muted rounded relative">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Assigned to {assignedAdmin?.name || "Admin"}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(ticket.updatedAt)}
                          </div>
                        </div>
                      </div>
                    )}
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
