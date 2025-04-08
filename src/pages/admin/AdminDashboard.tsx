
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockTickets, mockUsers } from "@/data/mockData";
import { TicketStatus } from "@/types";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  TicketIcon,
} from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();

  // Calculate stats
  const openTickets = mockTickets.filter((t) => t.status === "open").length;
  const inProgressTickets = mockTickets.filter((t) => t.status === "in-progress").length;
  const resolvedTickets = mockTickets.filter((t) => t.status === "resolved").length;
  const closedTickets = mockTickets.filter((t) => t.status === "closed").length;
  
  const totalUsers = mockUsers.filter((u) => u.role === "user").length;
  const totalAdmins = mockUsers.filter((u) => u.role === "admin").length;

  // Prepare chart data for ticket status distribution
  const statusCounts = {
    open: openTickets,
    "in-progress": inProgressTickets,
    resolved: resolvedTickets,
    closed: closedTickets,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of system metrics and ticket statistics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <TicketIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTickets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <AlertCircle className="h-4 w-4 text-status-open" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTickets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-status-in-progress" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTickets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-status-resolved" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedTickets + closedTickets}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Ticket Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(Object.keys(statusCounts) as TicketStatus[]).map((status) => (
                <div key={status} className="flex items-center">
                  <div className={`w-3 h-3 rounded-full bg-status-${status} mr-2`} />
                  <div className="flex-1 flex items-center">
                    <span className="capitalize text-sm">{status.replace("-", " ")}</span>
                  </div>
                  <div className="ml-auto flex items-center text-sm">
                    <span className="font-medium">{statusCounts[status]}</span>
                    <span className="text-muted-foreground ml-1">
                      ({Math.round((statusCounts[status] / mockTickets.length) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="h-2 mt-6 bg-muted rounded-full overflow-hidden flex">
              {(Object.keys(statusCounts) as TicketStatus[]).map((status) => (
                <div
                  key={status}
                  className={`h-full bg-status-${status}`}
                  style={{
                    width: `${(statusCounts[status] / mockTickets.length) * 100}%`,
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>User Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-muted-foreground mr-2" />
                <div className="flex-1">
                  <span className="text-sm">Total Users</span>
                </div>
                <div className="ml-auto">
                  <span className="font-medium">{mockUsers.length}</span>
                </div>
              </div>
              
              <div className="flex items-center pl-7">
                <div className="flex-1">
                  <span className="text-sm">End Users</span>
                </div>
                <div className="ml-auto">
                  <span className="font-medium">{totalUsers}</span>
                </div>
              </div>
              
              <div className="flex items-center pl-7">
                <div className="flex-1">
                  <span className="text-sm">Admins</span>
                </div>
                <div className="ml-auto">
                  <span className="font-medium">{totalAdmins}</span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="text-sm font-medium mb-2">Recently Active Users</div>
                {mockUsers.slice(0, 3).map((user) => (
                  <div key={user.id} className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2 text-xs font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTickets.slice(0, 5).map((ticket) => {
              const user = mockUsers.find((u) => u.id === ticket.userId);
              return (
                <div key={ticket.id} className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full bg-status-${ticket.status} mr-3`}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{ticket.title}</div>
                    <div className="text-xs text-muted-foreground flex space-x-2">
                      <span>#{ticket.id.split("-")[1]}</span>
                      <span>•</span>
                      <span className="capitalize">{ticket.priority} priority</span>
                      <span>•</span>
                      <span>{user?.name}</span>
                    </div>
                  </div>
                  <div className={`ticket-status-badge ticket-status-${ticket.status}`}>
                    {ticket.status.replace("-", " ")}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

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

export default AdminDashboard;
