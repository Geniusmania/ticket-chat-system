import React, { useState } from "react";
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
import { mockTickets, mockUsers, mockMessages } from "@/data/mockData";
import { ArrowLeft, Clock, FileText, User } from "lucide-react";
import TicketHeader from "@/components/tickets/TicketHeader";
import TicketInfo from "@/components/tickets/TicketInfo";
import ConversationCard from "@/components/tickets/ConversationCard";

const AdminTicketDetail = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(() => mockTickets.find((t) => t.id === ticketId));
  const [isSending, setIsSending] = useState(false);

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
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

  const messages = mockMessages.filter((m) => m.ticketId === ticket.id);
  
  const assignedAdmin = ticket.assignedToId 
    ? mockUsers.find((u) => u.id === ticket.assignedToId) 
    : null;

  const handleStatusChange = (status) => {
    setTicket((prev) => ({ ...prev, status }));
  };
  
  const handleAssignToChange = (userId) => {
    setTicket((prev) => ({ ...prev, assignedToId: userId }));
  };

  const handleSendMessage = (content) => {
    setIsSending(true);
    setTimeout(() => {
      const newMessage = {
        id: `message-${Date.now()}`,
        ticketId: ticket.id,
        userId: mockUsers.find((u) => u.role === "admin")?.id || "admin-1",
        content,
        createdAt: new Date().toISOString(),
        isAdminMessage: true,
      };
      
      mockMessages.push(newMessage);
      
      if (ticket.status === "open") {
        handleStatusChange("in-progress");
      }
      
      setIsSending(false);
    }, 500);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getUser = (userId) => {
    return mockUsers.find((u) => u.id === userId);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

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
            value={ticket.assignedToId || ""}
            onValueChange={handleAssignToChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select admin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unassigned</SelectItem>
              {mockUsers
                .filter((u) => u.role === "admin")
                .map((admin) => (
                  <SelectItem key={admin.id} value={admin.id}>
                    {admin.name}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-2">
          <h4 className="text-sm font-medium">User Information</h4>
          <div className="rounded-md bg-muted p-3">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{getUser(ticket.userId)?.name}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{getUser(ticket.userId)?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Joined: {formatDate(getUser(ticket.userId)?.createdAt || "")}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={() => navigate("/admin/users")}>
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
            ticketUser={getUser(ticket.userId)} 
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
                currentUserId={assignedAdmin?.id || mockUsers.find(u => u.role === "admin")?.id}
                getUser={getUser}
                formatDate={formatDate}
                getInitials={getInitials}
                onSendMessage={handleSendMessage}
                isSending={isSending}
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
                  <p className="text-muted-foreground text-center py-8">No attachments found</p>
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
                          {formatDate(ticket.createdAt)} by {getUser(ticket.userId)?.name}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="w-1 bg-muted rounded relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Status updated</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(new Date().toISOString())} by Admin
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
