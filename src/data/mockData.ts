
import { AuditLog, KnowledgeBase, Message, Ticket, User } from "../types";

export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    role: "user",
    createdAt: "2023-09-01T08:00:00Z",
    isVerified: true,
  },
  {
    id: "user-2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "user",
    createdAt: "2023-09-02T10:30:00Z",
    isVerified: true,
  },
  {
    id: "admin-1",
    name: "Admin User",
    email: "admin@tgtsafrica.com",
    role: "admin",
    createdAt: "2023-01-01T00:00:00Z",
    isVerified: true,
  },
];

export const mockTickets: Ticket[] = [
  {
    id: "ticket-1",
    title: "Cannot access my account",
    description: "I've been trying to log in but keep getting an error message.",
    status: "open",
    priority: "high",
    category: "technical",
    createdAt: "2023-09-03T14:22:00Z",
    updatedAt: "2023-09-03T14:22:00Z",
    userId: "user-1",
  },
  {
    id: "ticket-2",
    title: "Billing issue with last invoice",
    description: "I was charged twice for my last subscription payment.",
    status: "in-progress",
    priority: "medium",
    category: "billing",
    createdAt: "2023-09-04T09:11:00Z",
    updatedAt: "2023-09-04T15:33:00Z",
    userId: "user-1",
    assignedToId: "admin-1",
  },
  {
    id: "ticket-3",
    title: "How to reset my password",
    description: "I need instructions on how to reset my account password.",
    status: "resolved",
    priority: "low",
    category: "general",
    createdAt: "2023-09-01T16:40:00Z",
    updatedAt: "2023-09-02T11:25:00Z",
    userId: "user-2",
    assignedToId: "admin-1",
  },
  {
    id: "ticket-4",
    title: "Service outage reported",
    description: "I cannot connect to the service since this morning.",
    status: "closed",
    priority: "critical",
    category: "technical",
    createdAt: "2023-08-28T08:15:00Z",
    updatedAt: "2023-08-30T14:20:00Z",
    userId: "user-2",
    assignedToId: "admin-1",
  },
];

export const mockMessages: Message[] = [
  {
    id: "msg-1",
    content: "I've been trying to log in but keep getting an error message saying 'Invalid credentials' even though I'm sure my password is correct.",
    createdAt: "2023-09-03T14:22:00Z",
    ticketId: "ticket-1",
    userId: "user-1",
    isAdminMessage: false,
  },
  {
    id: "msg-2",
    content: "Hello John, I'm sorry to hear you're having trouble logging in. Could you please tell me what browser you're using and if you've tried clearing your cache?",
    createdAt: "2023-09-03T15:47:00Z",
    ticketId: "ticket-1",
    userId: "admin-1",
    isAdminMessage: true,
  },
  {
    id: "msg-3",
    content: "I was charged twice for my monthly subscription. The charges appear on my statement dated Sep 1st and Sep 2nd. Please help resolve this issue.",
    createdAt: "2023-09-04T09:11:00Z",
    ticketId: "ticket-2",
    userId: "user-1",
    isAdminMessage: false,
  },
  {
    id: "msg-4",
    content: "I'll check this with our billing department right away. Could you provide the last 4 digits of the card used for the transaction?",
    createdAt: "2023-09-04T15:33:00Z",
    ticketId: "ticket-2",
    userId: "admin-1",
    isAdminMessage: true,
  },
];

export const mockKnowledgeBase: KnowledgeBase[] = [
  {
    id: "kb-1",
    title: "How to Reset Your Password",
    content: "To reset your password, follow these steps: 1. Click on the 'Forgot Password' link on the login page...",
    category: "Account Management",
    createdAt: "2023-08-01T10:00:00Z",
    updatedAt: "2023-08-01T10:00:00Z",
    authorId: "admin-1",
  },
  {
    id: "kb-2",
    title: "Understanding Your Billing Cycle",
    content: "Your billing cycle begins on the date you first subscribed to our service...",
    category: "Billing",
    createdAt: "2023-08-02T11:30:00Z",
    updatedAt: "2023-08-15T09:20:00Z",
    authorId: "admin-1",
  },
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: "log-1",
    action: "User Login",
    entityType: "User",
    entityId: "user-1",
    userId: "user-1",
    timestamp: "2023-09-03T14:20:00Z",
    details: { browser: "Chrome", ip: "192.168.1.1" }
  },
  {
    id: "log-2",
    action: "Ticket Created",
    entityType: "Ticket",
    entityId: "ticket-1",
    userId: "user-1",
    timestamp: "2023-09-03T14:22:00Z",
    details: { ticketTitle: "Cannot access my account" }
  },
  {
    id: "log-3",
    action: "Ticket Status Changed",
    entityType: "Ticket",
    entityId: "ticket-2",
    userId: "admin-1",
    timestamp: "2023-09-04T15:33:00Z",
    details: { from: "open", to: "in-progress" }
  },
];
