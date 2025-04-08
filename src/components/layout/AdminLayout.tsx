
import React, { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AdminSidebar from "./AdminSidebar";
import Header from "./Header";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const AdminLayout = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Redirect to dashboard if not an admin
  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <AdminSidebar collapsed={sidebarCollapsed} toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className={cn("flex-1 flex flex-col", sidebarCollapsed ? "md:ml-16" : "md:ml-64")}>
        <Header />
        <main className="flex-1 p-4 md:p-6 transition-all duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
