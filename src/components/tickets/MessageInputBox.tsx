
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, X, FileText, Loader2 } from "lucide-react";

interface MessageInputBoxProps {
  onSend: (message: string, attachments?: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
  onTyping?: () => void;
}

const MessageInputBox: React.FC<MessageInputBoxProps> = ({
  onSend,
  disabled = false,
  placeholder = "Type your message here...",
  onTyping
}) => {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() || attachments.length > 0) {
      onSend(message.trim(), attachments.length > 0 ? attachments : undefined);
      setMessage("");
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Ctrl/Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSubmit(e);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Send typing notification with debounce
    if (onTyping) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        onTyping();
      }, 300);
    }
  };
  
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      // Simulate upload processing time
      setTimeout(() => {
        const newAttachments = Array.from(files);
        setAttachments(prev => [...prev, ...newAttachments]);
        setIsUploading(false);
      }, 500);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 border-t pt-4">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachments.map((file, index) => (
            <div 
              key={index}
              className="flex items-center bg-muted px-3 py-1 rounded-full text-sm"
            >
              <FileText className="h-3 w-3 mr-1" />
              <span className="truncate max-w-[150px]">{file.name}</span>
              <button 
                type="button"
                onClick={() => removeAttachment(index)}
                className="ml-2 text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove attachment</span>
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-start gap-2">
        <Textarea
          placeholder={placeholder}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="flex-1 min-h-[80px] resize-none"
        />
        <div className="flex flex-col gap-2">
          <Button 
            type="button"
            variant="outline"
            size="icon"
            onClick={openFileDialog}
            disabled={disabled || isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
            <span className="sr-only">Add attachment</span>
          </Button>
          <Button 
            type="submit"
            size="icon"
            disabled={disabled || (message.trim() === "" && attachments.length === 0)}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div className="text-xs text-muted-foreground mt-2">
        Press <kbd className="px-1 py-0.5 bg-muted rounded border">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-muted rounded border">Enter</kbd> to send
      </div>
    </form>
  );
};

export default MessageInputBox;
