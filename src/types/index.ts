export type UserRole = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  isVerified: boolean;
}

export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketCategory = 'technical' | 'billing' | 'general';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  createdAt: string;
  updatedAt: string;
  userId: string;
  assignedToId?: string;
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  ticketId: string;
  userId: string;
  isAdminMessage: boolean;
}

export interface Attachment {
  id: string;
  filename: string;
  path: string;
  ticketId: string;
  messageId?: string;
  uploadedAt: string;
  uploadedById: string;
}

export interface KnowledgeBase {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  authorId?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId?: string;
  timestamp: string;
  details?: Record<string, any>;
}
