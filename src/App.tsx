import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Layouts
import AppLayout from "@/components/layout/AppLayout";
import AdminLayout from "@/components/layout/AdminLayout";

// Auth pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// User pages
import Dashboard from "@/pages/Dashboard";
import NewTicket from "@/pages/NewTicket";
import TicketDetail from "@/pages/TicketDetail";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminInbox from "@/pages/admin/AdminInbox";

// Other pages
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* User Routes */}
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tickets" element={<Dashboard />} />
              <Route path="tickets/:ticketId" element={<TicketDetail />} />
              <Route path="new-ticket" element={<NewTicket />} />
              <Route path="knowledge-base" element={<Dashboard />} />
              <Route path="profile" element={<Dashboard />} />
            </Route>
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="inbox" element={<AdminInbox />} />
              <Route path="tickets/:ticketId" element={<TicketDetail />} />
              <Route path="users" element={<AdminDashboard />} />
              <Route path="knowledge-base" element={<AdminDashboard />} />
              <Route path="audit-logs" element={<AdminDashboard />} />
              <Route path="settings" element={<AdminDashboard />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
