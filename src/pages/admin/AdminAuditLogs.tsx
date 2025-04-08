
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Filter,
  Search,
  FileText,
  User,
  Bell,
  Key,
  ShieldAlert,
} from "lucide-react";
import { mockUsers } from "@/data/mockData";

// Mock audit logs
const mockAuditLogs = [
  {
    id: "log-1",
    action: "ticket_status_changed",
    entityType: "ticket",
    entityId: "ticket-123",
    userId: "user-1",
    timestamp: "2023-10-20T14:30:00Z",
    details: {
      ticketId: "ticket-123",
      oldStatus: "open",
      newStatus: "in-progress",
    },
  },
  {
    id: "log-2",
    action: "user_login",
    entityType: "user",
    entityId: "user-2",
    userId: "user-2",
    timestamp: "2023-10-20T10:15:00Z",
    details: {
      ipAddress: "192.168.1.1",
      browser: "Chrome",
    },
  },
  {
    id: "log-3",
    action: "ticket_created",
    entityType: "ticket",
    entityId: "ticket-124",
    userId: "user-3",
    timestamp: "2023-10-19T16:45:00Z",
    details: {
      ticketId: "ticket-124",
      title: "Cannot access dashboard",
    },
  },
  {
    id: "log-4",
    action: "message_sent",
    entityType: "message",
    entityId: "message-456",
    userId: "user-2",
    timestamp: "2023-10-19T15:10:00Z",
    details: {
      ticketId: "ticket-123",
      messageId: "message-456",
    },
  },
  {
    id: "log-5",
    action: "user_role_changed",
    entityType: "user",
    entityId: "user-4",
    userId: "user-1",
    timestamp: "2023-10-18T11:30:00Z",
    details: {
      targetUserId: "user-4",
      oldRole: "user",
      newRole: "admin",
    },
  },
];

const AdminAuditLogs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterEntityType, setFilterEntityType] = useState("all");

  // Filter audit logs based on filters and search
  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesAction = filterAction === "all" || log.action === filterAction;
    const matchesEntityType = filterEntityType === "all" || log.entityType === filterEntityType;
    const matchesSearch =
      searchQuery === "" ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesAction && matchesEntityType && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getUserName = (userId: string) => {
    const user = mockUsers.find((user) => user.id === userId);
    return user ? user.name : "System";
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "ticket_status_changed":
      case "ticket_created":
        return <FileText className="h-4 w-4" />;
      case "user_login":
      case "user_role_changed":
        return <User className="h-4 w-4" />;
      case "message_sent":
        return <Bell className="h-4 w-4" />;
      default:
        return <Key className="h-4 w-4" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "ticket_status_changed":
        return "Ticket Status Changed";
      case "user_login":
        return "User Login";
      case "ticket_created":
        return "Ticket Created";
      case "message_sent":
        return "Message Sent";
      case "user_role_changed":
        return "User Role Changed";
      default:
        return action.replace(/_/g, " ");
    }
  };

  const getActionSeverity = (action: string) => {
    if (action === "user_role_changed") return "destructive";
    if (action === "ticket_status_changed") return "warning";
    return "default";
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">
          System activity log for tracking and compliance
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative w-full md:w-auto md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Select
            value={filterAction}
            onValueChange={setFilterAction}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="ticket_status_changed">Status Change</SelectItem>
              <SelectItem value="user_login">User Login</SelectItem>
              <SelectItem value="ticket_created">Ticket Created</SelectItem>
              <SelectItem value="message_sent">Message Sent</SelectItem>
              <SelectItem value="user_role_changed">Role Changed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterEntityType}
            onValueChange={setFilterEntityType}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by entity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              <SelectItem value="ticket">Ticket</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="message">Message</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Activity</CardTitle>
          <CardDescription>
            {filteredLogs.length} log entries found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={getActionSeverity(log.action)}>
                          {getActionIcon(log.action)}
                          <span className="ml-1">{getActionLabel(log.action)}</span>
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="capitalize">{log.entityType}</span>
                        <span className="text-xs text-muted-foreground">
                          ID: {log.entityId}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getUserName(log.userId)}</TableCell>
                    <TableCell>
                      <div className="max-w-xs text-sm truncate">
                        {log.action === "ticket_status_changed" && (
                          <span>
                            Status changed from{" "}
                            <span className="font-medium">
                              {log.details.oldStatus}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium">
                              {log.details.newStatus}
                            </span>
                          </span>
                        )}
                        {log.action === "user_login" && (
                          <span>
                            Login from {log.details.ipAddress} ({log.details.browser})
                          </span>
                        )}
                        {log.action === "ticket_created" && (
                          <span>
                            Created ticket: {log.details.title}
                          </span>
                        )}
                        {log.action === "message_sent" && (
                          <span>
                            Sent message on ticket {log.details.ticketId}
                          </span>
                        )}
                        {log.action === "user_role_changed" && (
                          <span>
                            Changed role from{" "}
                            <span className="font-medium">
                              {log.details.oldRole}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium">
                              {log.details.newRole}
                            </span>
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredLogs.length === 0 && (
              <div className="text-center p-4">
                <p className="text-muted-foreground">No audit logs found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuditLogs;
