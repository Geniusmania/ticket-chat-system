
import React from "react";
import { File, FileText, Image, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Attachment, Message, User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface AttachmentsListProps {
  attachments: Attachment[];
  messages: Message[];
  getUser: (userId: string) => User | undefined;
}

const AttachmentsList: React.FC<AttachmentsListProps> = ({
  attachments,
  messages,
  getUser,
}) => {
  if (attachments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">No attachments yet</p>
        </div>
      </div>
    );
  }

  const getAttachmentMessage = (attachment: Attachment) => {
    if (attachment.messageId) {
      return messages.find(msg => msg.id === attachment.messageId);
    }
    return null;
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    if (extension && ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension)) {
      return <Image className="h-8 w-8 text-blue-500" />;
    }
    
    if (extension && ['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
      return <FileText className="h-8 w-8 text-orange-500" />;
    }
    
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('attachments')
        .download(attachment.path);
        
      if (error) {
        throw error;
      }
      
      // Create a URL for the file
      const url = URL.createObjectURL(data);
      
      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.filename || 'download';
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: 'Download failed',
        description: 'Could not download the file. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      {attachments.map((attachment) => {
        const message = getAttachmentMessage(attachment);
        const user = getUser(attachment.uploadedById);
        
        return (
          <div 
            key={attachment.id}
            className="border rounded-md p-4 flex items-center justify-between"
          >
            <div className="flex items-center">
              <div className="mr-4">
                {getFileIcon(attachment.filename)}
              </div>
              <div>
                <h4 className="font-medium">{attachment.filename}</h4>
                <p className="text-sm text-muted-foreground">
                  Uploaded by {user?.name || 'Unknown'} 
                  {message && ` in a message on ${new Date(message.createdAt).toLocaleDateString()}`}
                </p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleDownload(attachment)}
              className="ml-4"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        );
      })}
    </div>
  );
};

export default AttachmentsList;
