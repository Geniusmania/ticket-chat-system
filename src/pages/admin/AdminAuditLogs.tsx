import React from "react";
import { mockAuditLogs } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AdminAuditLogs = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">
          Track and monitor all activities performed by users and admins.
        </p>
      </div>

      <div className="grid gap-4">
        {mockAuditLogs.map((log) => (
          <Card key={log.id}>
            <CardHeader>
              <CardTitle>{log.action}</CardTitle>
              <CardDescription>
                <Badge variant="secondary">{log.action}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Entity Type:</strong> {log.entityType}
              </p>
              <p>
                <strong>Entity ID:</strong> {log.entityId}
              </p>
              {log.userId && (
                <p>
                  <strong>User ID:</strong> {log.userId}
                </p>
              )}
              <p>
                <strong>Timestamp:</strong> {new Date(log.timestamp).toLocaleString()}
              </p>
              {log.details && (
                <div>
                  <strong>Details:</strong>
                  <pre>{JSON.stringify(log.details, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminAuditLogs;
