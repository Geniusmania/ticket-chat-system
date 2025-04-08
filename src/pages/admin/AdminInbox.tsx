
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockTickets, mockUsers } from "@/data/mockData";
import { Ticket } from "@/types";
import { Search } from "lucide-react";

const AdminInbox = () => {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const navigate = useNavigate();

  // Filter tickets based on selected filters and search query
  const filteredTickets = mockTickets.filter((ticket) => {
    const matchesStatus = filterStatus === "all" || ticket.status === filterStatus;
    const matchesPriority = filterPriority === "all" || ticket.priority === filterPriority;
    const matchesSearch =
      searchQuery === "" ||
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  const getUserName = (userId: string) => {
    const user = mockUsers.find((u) => u.id === userId);
    return user ? user.name : "Unknown User";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Group tickets by date for better organization
  const groupedTickets: Record<string, Ticket[]> = filteredTickets.reduce(
    (groups, ticket) => {
      const date = new Date(ticket.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(ticket);
      return groups;
    },
    {} as Record<string, Ticket[]>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Support Inbox</h1>
        <p className="text-muted-foreground">
          Manage and respond to user support tickets
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative w-full md:w-auto md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select
            value={filterStatus}
            onValueChange={setFilterStatus}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterPriority}
            onValueChange={setFilterPriority}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
          <CardDescription>
            {filteredTickets.length} tickets found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.entries(groupedTickets).map(([date, tickets]) => (
            <div key={date} className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <div className="space-y-2">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center p-3 bg-card border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/tickets/${ticket.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 bg-status-${ticket.status}`}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between">
                            <h4 className="font-medium truncate mr-2">
                              {ticket.title}
                            </h4>
                            <span className="text-xs whitespace-nowrap text-muted-foreground">
                              {formatDate(ticket.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center mt-1">
                            <p className="text-sm text-muted-foreground truncate">
                              <span className="font-medium">
                                {getUserName(ticket.userId)}
                              </span>{" "}
                              - {ticket.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <div className={`ticket-priority-badge ticket-priority-${ticket.priority}`}>
                        {ticket.priority}
                      </div>
                      <div className={`ticket-status-badge ticket-status-${ticket.status}`}>
                        {ticket.status.replace("-", " ")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredTickets.length === 0 && (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-1">No tickets found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInbox;
