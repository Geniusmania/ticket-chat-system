
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Chart } from "@/components/ui/chart";
import { Loader2, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { mockTickets } from "@/data/mockData"; // Using mock data for now

// Chart data
const ticketsByStatusData = {
  labels: ["Open", "In Progress", "Resolved", "Closed"],
  datasets: [
    {
      data: [12, 8, 15, 5],
      backgroundColor: ["#f87171", "#60a5fa", "#4ade80", "#a3a3a3"],
    },
  ],
};

const ticketsOverTimeData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Tickets Created",
      data: [18, 25, 20, 30, 24, 22],
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      tension: 0.3,
      fill: true,
    },
    {
      label: "Tickets Resolved",
      data: [15, 20, 18, 25, 22, 19],
      borderColor: "#10b981",
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      tension: 0.3,
      fill: true,
    },
  ],
};

const Dashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userTickets, setUserTickets] = useState([]); 
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    // In a real implementation, fetch tickets from Supabase
    // For now, simulate loading and use mock data
    const loadTickets = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter tickets for current user
      const filteredTickets = mockTickets.filter(ticket => ticket.userId === user?.id);
      setUserTickets(filteredTickets);
      setIsLoading(false);
    };

    if (user) {
      loadTickets();
    }
  }, [user]);

  const getTicketsByStatus = (status) => {
    if (activeTab === "all") {
      return userTickets;
    }
    return userTickets.filter(ticket => ticket.status.toLowerCase() === activeTab);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "open":
        return <Badge className="bg-red-500">Open</Badge>;
      case "in progress":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-green-500">Resolved</Badge>;
      case "closed":
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || "User"}
          </p>
        </div>
        <Button asChild>
          <Link to="/new-ticket">
            <Plus className="mr-2 h-4 w-4" /> New Ticket
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  userTickets.filter(t => t.status.toLowerCase() === "open").length
                )}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  userTickets.filter(t => t.status.toLowerCase() === "in progress").length
                )}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-2xl font-bold">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  userTickets.filter(t => t.status.toLowerCase() === "resolved").length
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Tickets by Status</CardTitle>
            <CardDescription>Distribution of your support tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              type="doughnut"
              data={ticketsByStatusData}
              options={{
                plugins: {
                  legend: {
                    position: "bottom",
                  },
                },
                maintainAspectRatio: false,
              }}
              className="h-64"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tickets Over Time</CardTitle>
            <CardDescription>Monthly ticket trends</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              type="line"
              data={ticketsOverTimeData}
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
                plugins: {
                  legend: {
                    position: "bottom",
                  },
                },
                maintainAspectRatio: false,
              }}
              className="h-64"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Tickets</CardTitle>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Tickets</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="in progress">In Progress</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : getTicketsByStatus(activeTab).length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No tickets found</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link to="/new-ticket">
                  <Plus className="mr-2 h-4 w-4" /> Create New Ticket
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {getTicketsByStatus(activeTab).map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="text-base font-medium hover:underline"
                    >
                      {ticket.title}
                    </Link>
                    <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-2 mt-1">
                      <span>#{ticket.id}</span>
                      <span>•</span>
                      <span>Created: {formatDate(ticket.createdAt)}</span>
                      <span>•</span>
                      <span>{ticket.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(ticket.status)}
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/tickets/${ticket.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/new-ticket">Create New Ticket</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Dashboard;
