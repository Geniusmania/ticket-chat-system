import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Clock, FileQuestion } from "lucide-react";
import { BarChart, LineChart, PieChart } from "@/components/ui/chart";
import { mockTickets } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Ticket } from "@/types";

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserTickets = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("tickets")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
          
        if (error) {
          console.error("Error fetching tickets:", error);
          setIsLoading(false);
          return;
        }
        
        setTickets((data || []).map(item => ({
          ...item,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          userId: item.user_id,
        })));
      } catch (error) {
        console.error("Error in fetchUserTickets:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserTickets();
  }, [user]);

  // Use mockTickets if no data from Supabase
  const displayTickets = tickets.length > 0 ? tickets : (user ? mockTickets.filter(ticket => ticket.userId === user.id) : []);

  const getStatusCounts = () => {
    const counts = { open: 0, "in-progress": 0, resolved: 0, closed: 0 };
    displayTickets.forEach(ticket => {
      if (ticket.status in counts) {
        counts[ticket.status] += 1;
      }
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  // Chart data based on ticket status
  const pieChartData = [
    { name: "Open", value: statusCounts.open },
    { name: "In Progress", value: statusCounts["in-progress"] },
    { name: "Resolved", value: statusCounts.resolved },
    { name: "Closed", value: statusCounts.closed },
  ];

  // Time series data for ticket creation
  const lineChartData = [
    { date: "Week 1", tickets: 5 },
    { date: "Week 2", tickets: 8 },
    { date: "Week 3", tickets: 3 },
    { date: "Week 4", tickets: 7 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name || "User"}</h1>
          <p className="text-muted-foreground">
            Here's an overview of your support tickets
          </p>
        </div>
        <Button asChild className="mt-4 md:mt-0">
          <Link to="/new-ticket">Create New Ticket</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
                <p className="text-2xl font-bold">{displayTickets.length}</p>
              </div>
              <FileQuestion className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Resolved
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {statusCounts.resolved}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  In Progress
                </p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  {statusCounts["in-progress"]}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  Open
                </p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {statusCounts.open}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Status Distribution</CardTitle>
                <CardDescription>
                  Distribution of your tickets by status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  height={300}
                  colors={["#ef4444", "#f59e0b", "#10b981", "#3b82f6"]}
                  innerRadius={40}
                  showTooltip={true}
                  showLegend={true}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your ticket activity over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={lineChartData}
                  xAxisKey="date"
                  dataKeys={["tickets"]}
                  height={300}
                  showGrid={true}
                  showTooltip={true}
                  colors={["#2563eb"]}
                />
              </CardContent>
            </Card>
          </div>

          {displayTickets.length === 0 && !isLoading && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You don't have any tickets yet. Create your first ticket to get started.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <CardTitle>My Tickets</CardTitle>
              <CardDescription>
                View and manage all your support tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading your tickets...</p>
                </div>
              ) : displayTickets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You don't have any tickets yet</p>
                  <Button asChild>
                    <Link to="/new-ticket">Create Your First Ticket</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {displayTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between border rounded-md p-4"
                    >
                      <div>
                        <Link
                          to={`/tickets/${ticket.id}`}
                          className="font-medium hover:underline"
                        >
                          {ticket.title}
                        </Link>
                        <div className="flex mt-1 space-x-4 text-sm">
                          <span className="text-muted-foreground">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                          <span className={`ticket-status-${ticket.status}`}>
                            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace("-", " ")}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link to={`/tickets/${ticket.id}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;