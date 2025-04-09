
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { PieChart, LineChart } from "@/components/ui/chart";
import { PlusCircle, Clock, AlertTriangle, CheckCircle, Inbox } from "lucide-react";
import { mockTickets } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import type { Ticket } from "@/types";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data, error } = await supabase
          .from("tickets")
          .select("*")
          .eq("user_id", user?.id);
          
        if (error) {
          console.error("Error fetching tickets:", error);
          toast({
            title: "Failed to load tickets",
            description: "Please try again later",
            variant: "destructive",
          });
          
          // Fall back to mock data
          setTickets(mockTickets.filter(ticket => ticket.userId === user?.id).map(ticket => ({
            id: ticket.id,
            title: ticket.title,
            description: ticket.description,
            status: ticket.status,
            priority: ticket.priority,
            category: ticket.category,
            createdAt: ticket.createdAt,
            updatedAt: ticket.updatedAt,
            userId: ticket.userId,
            assignedToId: ticket.assignedToId,
          })));
        } else if (data) {
          // Transform the data to match our Ticket type
          const formattedTickets: Ticket[] = data.map(ticket => ({
            id: ticket.id,
            title: ticket.title,
            description: ticket.description,
            status: ticket.status,
            priority: ticket.priority,
            category: ticket.category,
            createdAt: ticket.created_at,
            updatedAt: ticket.updated_at,
            userId: ticket.user_id,
            assignedToId: ticket.assigned_to_id,
          }));
          
          setTickets(formattedTickets);
        }
      } catch (error) {
        console.error("Error in fetchTickets:", error);
        // Fall back to mock data
        setTickets(mockTickets.filter(ticket => ticket.userId === user?.id).map(ticket => ({
          id: ticket.id,
          title: ticket.title,
          description: ticket.description,
          status: ticket.status,
          priority: ticket.priority,
          category: ticket.category,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
          userId: ticket.userId,
          assignedToId: ticket.assignedToId,
        })));
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchTickets();
    }
  }, [user?.id]);

  // Get counts for each status
  const openTickets = tickets.filter(ticket => ticket.status === "open").length;
  const inProgressTickets = tickets.filter(ticket => ticket.status === "in-progress").length;
  const resolvedTickets = tickets.filter(ticket => ticket.status === "resolved").length;
  const closedTickets = tickets.filter(ticket => ticket.status === "closed").length;

  // Get count for each category
  const technicalTickets = tickets.filter(ticket => ticket.category === "technical").length;
  const billingTickets = tickets.filter(ticket => ticket.category === "billing").length;
  const generalTickets = tickets.filter(ticket => ticket.category === "general").length;

  // Calculate statistics
  const totalTickets = tickets.length;
  const activeTickets = openTickets + inProgressTickets;
  const completedTickets = resolvedTickets + closedTickets;
  const completionRate = totalTickets > 0 ? Math.round((completedTickets / totalTickets) * 100) : 0;

  const chartData = [
    {
      name: "Open",
      value: openTickets,
    },
    {
      name: "In Progress",
      value: inProgressTickets,
    },
    {
      name: "Resolved",
      value: resolvedTickets,
    },
    {
      name: "Closed",
      value: closedTickets,
    },
  ];

  const categoryData = [
    {
      name: "Technical",
      value: technicalTickets,
    },
    {
      name: "Billing",
      value: billingTickets,
    },
    {
      name: "General",
      value: generalTickets,
    },
  ];

  // Generate temporary activity data (would come from real data in a production app)
  const getLast7Days = () => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      result.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return result;
  };

  const activityData = [
    {
      name: getLast7Days()[0],
      tickets: Math.floor(Math.random() * 5),
    },
    {
      name: getLast7Days()[1],
      tickets: Math.floor(Math.random() * 5),
    },
    {
      name: getLast7Days()[2],
      tickets: Math.floor(Math.random() * 5),
    },
    {
      name: getLast7Days()[3],
      tickets: Math.floor(Math.random() * 5),
    },
    {
      name: getLast7Days()[4],
      tickets: Math.floor(Math.random() * 5),
    },
    {
      name: getLast7Days()[5],
      tickets: Math.floor(Math.random() * 5),
    },
    {
      name: getLast7Days()[6],
      tickets: Math.floor(Math.random() * 5),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name || "User"}</p>
        </div>
        <Button onClick={() => navigate("/new-ticket")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Ticket
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              {activeTickets} active, {completedTickets} completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTickets}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTickets}</div>
            <p className="text-xs text-muted-foreground">
              Being worked on
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {resolvedTickets} resolved, {closedTickets} closed
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Ticket Status</CardTitle>
                <CardDescription>
                  Distribution of tickets by status
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <PieChart
                  data={chartData}
                  categories={["value"]}
                  valueFormatter={(value) => `${value} tickets`}
                  className="h-80"
                />
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>
                  Distribution of tickets by category
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <PieChart
                  data={categoryData}
                  categories={["value"]}
                  valueFormatter={(value) => `${value} tickets`}
                  className="h-80"
                />
              </CardContent>
            </Card>
            <Card className="col-span-1 lg:col-span-1">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Ticket activity in the last 7 days
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <LineChart
                  data={activityData}
                  categories={["tickets"]}
                  valueFormatter={(value) => `${value} tickets`}
                  className="h-80"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <CardTitle>Recent Tickets</CardTitle>
              <CardDescription>
                Your recently created support tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You haven't created any tickets yet</p>
                  <Button onClick={() => navigate("/new-ticket")}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Your First Ticket
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {tickets.slice(0, 5).map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between p-3 bg-card border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full bg-status-${ticket.status}`}></div>
                          <h4 className="font-medium">{ticket.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{ticket.description.substring(0, 60)}...</p>
                      </div>
                      <div className={`ticket-priority-badge ticket-priority-${ticket.priority}`}>
                        {ticket.priority}
                      </div>
                    </div>
                  ))}
                  {tickets.length > 5 && (
                    <div className="text-center mt-4">
                      <Button variant="outline" onClick={() => navigate("/dashboard")} className="w-full">
                        View All Tickets
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator className="my-6" />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Knowledge Base</CardTitle>
            <CardDescription>
              Browse our help articles and guides
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="p-3 bg-card border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                <h4 className="font-medium">How to create a new ticket</h4>
                <p className="text-sm text-muted-foreground">Learn how to properly submit support requests</p>
              </div>
              <div className="p-3 bg-card border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                <h4 className="font-medium">Frequently asked questions</h4>
                <p className="text-sm text-muted-foreground">Common questions and their answers</p>
              </div>
              <div className="p-3 bg-card border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                <h4 className="font-medium">Technical troubleshooting</h4>
                <p className="text-sm text-muted-foreground">Solutions to common technical issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Support Hours</CardTitle>
            <CardDescription>
              When our team is available to assist you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Monday - Friday</span>
                <span>9:00 AM - 5:00 PM</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-medium">Saturday</span>
                <span>10:00 AM - 2:00 PM</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-medium">Sunday</span>
                <span>Closed</span>
              </div>
              <Separator />
              <p className="text-sm text-muted-foreground pt-2">
                All times are in Eastern Standard Time (EST).
                Emergency support is available 24/7 for critical issues.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
