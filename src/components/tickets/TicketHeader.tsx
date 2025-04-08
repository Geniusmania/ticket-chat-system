
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardHeader,
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Ticket } from "@/types";

interface TicketHeaderProps {
  ticket: Ticket;
}

const TicketHeader: React.FC<TicketHeaderProps> = ({ ticket }) => {
  const navigate = useNavigate();
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="mb-2"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center">
                {ticket.title}
              </CardTitle>
              <CardDescription>
                Ticket #{ticket.id.split("-")[1]}
              </CardDescription>
            </div>
            <div className={`ticket-status-badge ticket-status-${ticket.status}`}>
              {ticket.status.replace("-", " ")}
            </div>
          </div>
        </CardHeader>
      </Card>
    </>
  );
};

export default TicketHeader;
