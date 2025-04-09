
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import Dashboard from "@/pages/Dashboard";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import NewTicket from "@/pages/NewTicket";
import NotFound from "@/pages/NotFound";
import Register from "@/pages/Register";
import TicketDetail from "@/pages/TicketDetail";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminInbox from "@/pages/admin/AdminInbox";
import AdminTicketDetail from "@/pages/admin/AdminTicketDetail";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminKnowledgeBase from "@/pages/admin/AdminKnowledgeBase";
import AdminKnowledgeBaseEditor from "@/pages/admin/AdminKnowledgeBaseEditor";
import AdminAuditLogs from "@/pages/admin/AdminAuditLogs";
import "./App.css";
import { useAuth } from "@/contexts/AuthContext";

// Protected route component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requireAdmin && user?.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="new-ticket" element={<NewTicket />} />
        <Route path="tickets/:ticketId" element={<TicketDetail />} />
      </Route>
      
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="inbox" element={<AdminInbox />} />
        <Route path="tickets/:ticketId" element={<AdminTicketDetail />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="knowledge-base" element={<AdminKnowledgeBase />} />
        <Route path="knowledge-base/:articleId" element={<AdminKnowledgeBaseEditor />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="settings" element={<div>Settings Page Coming Soon</div>} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
