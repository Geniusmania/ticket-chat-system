
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { mockTickets } from "@/data/mockData";
import { Plus, AlertCircle, CheckCircle, Clock } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Filter tickets for the current user
  const userTickets = mockTickets.filter(ticket => ticket.userId === user?.id);
  
  const openTickets = userTickets.filter(ticket => ticket.status === "open" || ticket.status === "in-progress");
  const closedTickets = userTickets.filter(ticket => ticket.status === "resolved" || ticket.status === "closed");

  return (
    <div>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">
            Here's an overview of your support tickets
          </p>
        </div>
        <Button
          className="mt-4 lg:mt-0"
          onClick={() => navigate("/new-ticket")}
        >
          <Plus className="mr-2 h-4 w-4" /> New Ticket
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <TicketIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userTickets.length}</div>
            <p className="text-xs text-muted-foreground">
              All submitted tickets
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTickets.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting resolution
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{closedTickets.length}</div>
            <p className="text-xs text-muted-foreground">
              Completed tickets
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Tickets</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="space-y-4">
            {userTickets.length > 0 ? (
              userTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                />
              ))
            ) : (
              <EmptyTickets />
            )}
          </div>
        </TabsContent>
        <TabsContent value="open">
          <div className="space-y-4">
            {openTickets.length > 0 ? (
              openTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                />
              ))
            ) : (
              <EmptyTickets message="No open tickets" />
            )}
          </div>
        </TabsContent>
        <TabsContent value="closed">
          <div className="space-y-4">
            {closedTickets.length > 0 ? (
              closedTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                />
              ))
            ) : (
              <EmptyTickets message="No closed tickets" />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper component for displaying tickets
const TicketCard = ({ ticket, onClick }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-medium">{ticket.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {ticket.description}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`ticket-status-badge ticket-status-${ticket.status}`}>
              {ticket.status.replace("-", " ")}
            </div>
            <div className={`ticket-priority-badge ticket-priority-${ticket.priority}`}>
              {ticket.priority}
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="text-xs text-muted-foreground">
            Created: {formatDate(ticket.createdAt)}
          </div>
          <div className="text-xs text-muted-foreground">
            #{ticket.id.split("-")[1]}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Reusable empty state component
const EmptyTickets = ({ message = "No tickets found" }) => (
  <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/20">
    <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
    <h3 className="text-lg font-medium">{message}</h3>
    <p className="text-muted-foreground text-center mt-1">
      Create a new ticket by clicking the button above.
    </p>
  </div>
);

// SVG Icon for Tickets
const TicketIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" />
    <path d="M13 17v2" />
    <path d="M13 11v2" />
  </svg>
);

export default Dashboard;
