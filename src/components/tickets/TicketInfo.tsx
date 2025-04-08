
import React from "react";
import { Clock, Calendar, Tag, AlertTriangle } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { Ticket, User } from "@/types";

interface TicketInfoProps {
  ticket: Ticket;
  ticketUser: User | undefined;
  formatDate: (date: string) => string;
}

const TicketInfo: React.FC<TicketInfoProps> = ({
  ticket,
  ticketUser,
  formatDate
}) => {
  return (
    <CardContent>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Description:</div>
          <div>{ticket.description}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-muted-foreground mr-2" />
            <div>
              <div className="text-muted-foreground">Submitted</div>
              <div>{formatDate(ticket.createdAt)}</div>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
            <div>
              <div className="text-muted-foreground">Last Updated</div>
              <div>{formatDate(ticket.updatedAt)}</div>
            </div>
          </div>
          <div className="flex items-center">
            <Tag className="h-4 w-4 text-muted-foreground mr-2" />
            <div>
              <div className="text-muted-foreground">Category</div>
              <div className="capitalize">{ticket.category}</div>
            </div>
          </div>
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-muted-foreground mr-2" />
            <div>
              <div className="text-muted-foreground">Priority</div>
              <div className={`text-priority-${ticket.priority} capitalize`}>
                {ticket.priority}
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4 flex items-center">
          <div className="text-sm">
            <div className="text-muted-foreground">Submitted by:</div>
            <div className="font-medium">{ticketUser?.name}</div>
            <div className="text-xs text-muted-foreground">
              {ticketUser?.email}
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  );
};

export default TicketInfo;
