
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { Attachment, Message, User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface AttachmentsListProps {
  attachments: Attachment[];
  messages?: Message[];
  getUser?: (userId: string) => User | undefined;
}

const AttachmentsList: React.FC<AttachmentsListProps> = ({
  attachments,
  messages = [],
  getUser = () => undefined
}) => {
  const handleDownload = async (attachment: Attachment) => {
    try {
      const { data, error } = await supabase.storage
        .from("attachments")
        .download(attachment.path);
      
      if (error) throw error;
      
      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.filename;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download failed",
        description: "Unable to download the file",
        variant: "destructive"
      });
    }
  };

  if (!attachments.length) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">No attachments have been added to this ticket</p>
      </div>
    );
  }

  // Group attachments by message
  const getAttachmentsWithContext = () => {
    // First, let's group attachments by messageId
    const groupedByMessage = attachments.reduce((groups, attachment) => {
      const key = attachment.messageId || 'standalone';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(attachment);
      return groups;
    }, {} as Record<string, Attachment[]>);

    // Now let's format them for display
    const result = Object.entries(groupedByMessage).map(([messageId, attachmentGroup]) => {
      // Find the related message if it exists
      const relatedMessage = messageId !== 'standalone' 
        ? messages.find(m => m.id === messageId)
        : null;
        
      // Get user info if available
      const user = relatedMessage && getUser
        ? getUser(relatedMessage.userId)
        : null;
        
      return {
        messageId,
        user,
        message: relatedMessage,
        attachments: attachmentGroup
      };
    });
    
    return result;
  };

  const attachmentsWithContext = getAttachmentsWithContext();

  return (
    <div className="space-y-6">
      {attachmentsWithContext.map(({ messageId, user, message, attachments: groupAttachments }) => (
        <div key={messageId} className="border rounded-lg p-4 bg-card">
          {user && (
            <div className="mb-3 text-sm font-medium">
              Uploaded by {user.name} {message && `in message`}
            </div>
          )}
          
          {message && (
            <div className="mb-4 text-sm text-muted-foreground border-l-4 border-muted pl-3 py-1">
              "{message.content.length > 100 
                ? `${message.content.substring(0, 100)}...` 
                : message.content}"
            </div>
          )}
          
          <div className="space-y-3">
            {groupAttachments.map(attachment => (
              <div 
                key={attachment.id} 
                className="flex items-center justify-between p-3 bg-card border rounded-lg"
              >
                <div className="flex items-center overflow-hidden">
                  <FileText className="h-5 w-5 mr-3 flex-shrink-0 text-muted-foreground" />
                  <span className="truncate">{attachment.filename}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2 flex-shrink-0"
                  onClick={() => handleDownload(attachment)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttachmentsList;
