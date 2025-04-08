
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import AppLayout from "@/components/layout/AppLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import Dashboard from "@/pages/Dashboard";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import NewTicket from "@/pages/NewTicket";
import NotFound from "@/pages/NotFound";
import Register from "@/pages/Register";
import TicketDetail from "@/pages/TicketDetail";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminInbox from "@/pages/admin/AdminInbox";
import AdminTicketDetail from "@/pages/admin/AdminTicketDetail";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminKnowledgeBase from "@/pages/admin/AdminKnowledgeBase";
import AdminAuditLogs from "@/pages/admin/AdminAuditLogs";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<AppLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="new-ticket" element={<NewTicket />} />
          <Route path="tickets/:ticketId" element={<TicketDetail />} />
        </Route>
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="inbox" element={<AdminInbox />} />
          <Route path="tickets/:ticketId" element={<AdminTicketDetail />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="knowledge-base" element={<AdminKnowledgeBase />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="settings" element={<div>Settings Page Coming Soon</div>} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
