
import React, { useState } from "react";
import { mockAuditLogs } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Filter } from "lucide-react";

const AdminAuditLogs = () => {
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterEntityType, setFilterEntityType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Get unique actions and entity types for filters
  const uniqueActions = Array.from(new Set(mockAuditLogs.map(log => log.action)));
  const uniqueEntityTypes = Array.from(new Set(mockAuditLogs.map(log => log.entityType)));

  // Filter audit logs
  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesAction = filterAction === "all" || log.action === filterAction;
    const matchesEntityType = filterEntityType === "all" || log.entityType === filterEntityType;
    const matchesSearch = searchQuery === "" || 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
      log.entityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.userId && log.userId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.entityId.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesAction && matchesEntityType && matchesSearch;
  });

  // Group logs by date
  const groupedLogs = filteredLogs.reduce((groups, log) => {
    const date = new Date(log.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {} as Record<string, typeof mockAuditLogs>);

  const getActionBadgeVariant = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'default';
      case 'update':
        return 'outline';
      case 'delete':
        return 'destructive';
      case 'login':
        return 'secondary';
      case 'logout':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">
          Track and monitor all activities performed by users and admins
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
        <div className="flex gap-2 w-full md:w-auto">
          <Select
            value={filterAction}
            onValueChange={setFilterAction}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {uniqueActions.map(action => (
                <SelectItem key={action} value={action}>{action}</SelectItem>
              ))}
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
              {uniqueEntityTypes.map(entityType => (
                <SelectItem key={entityType} value={entityType}>{entityType}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Activity Log</CardTitle>
          <CardDescription>
            {filteredLogs.length} logs found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.entries(groupedLogs).map(([date, logs]) => (
            <div key={date} className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              <div className="space-y-3">
                {logs.map((log) => (
                  <div 
                    key={log.id} 
                    className="p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {log.action}
                        </Badge>
                        <Badge variant="outline">{log.entityType}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="grid gap-1 text-sm">
                      <div className="flex items-center">
                        <span className="w-24 font-medium">Entity ID:</span>
                        <span className="truncate">{log.entityId}</span>
                      </div>
                      
                      {log.userId && (
                        <div className="flex items-center">
                          <span className="w-24 font-medium">User ID:</span>
                          <span className="truncate">{log.userId}</span>
                        </div>
                      )}
                      
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="mt-2 p-3 bg-muted rounded-md">
                          <div className="font-medium mb-1">Details:</div>
                          <pre className="text-xs overflow-auto max-h-[100px]">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {filteredLogs.length === 0 && (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-1">No logs found</h3>
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

export default AdminAuditLogs;
