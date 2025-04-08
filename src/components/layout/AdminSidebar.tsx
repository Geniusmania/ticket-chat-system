
import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Inbox,
  Users,
  Book,
  Settings,
  FileText,
} from "lucide-react";

interface AdminSidebarProps {
  collapsed: boolean;
  toggleCollapse: () => void;
}

const AdminSidebar = ({ collapsed, toggleCollapse }: AdminSidebarProps) => {
  return (
    <div
      className={cn(
        "fixed top-0 left-0 h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out z-20",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b border-sidebar-border px-3">
          {!collapsed ? (
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-sidebar-foreground">TGTS Admin</h2>
            </div>
          ) : (
            <div className="flex-1 flex justify-center">
              <span className="text-lg font-semibold text-sidebar-foreground">TA</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground"
            onClick={toggleCollapse}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
            <span className="sr-only">
              {collapsed ? "Expand sidebar" : "Collapse sidebar"}
            </span>
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="px-3 py-4">
            <nav className="space-y-1">
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  cn(
                    "flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground",
                    collapsed && "justify-center px-0"
                  )
                }
              >
                <LayoutDashboard className="h-5 w-5" />
                {!collapsed && <span className="ml-3">Dashboard</span>}
              </NavLink>
              <NavLink
                to="/admin/inbox"
                className={({ isActive }) =>
                  cn(
                    "flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground",
                    collapsed && "justify-center px-0"
                  )
                }
              >
                <Inbox className="h-5 w-5" />
                {!collapsed && <span className="ml-3">Inbox</span>}
              </NavLink>
              <NavLink
                to="/admin/users"
                className={({ isActive }) =>
                  cn(
                    "flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground",
                    collapsed && "justify-center px-0"
                  )
                }
              >
                <Users className="h-5 w-5" />
                {!collapsed && <span className="ml-3">Users</span>}
              </NavLink>
              <NavLink
                to="/admin/knowledge-base"
                className={({ isActive }) =>
                  cn(
                    "flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground",
                    collapsed && "justify-center px-0"
                  )
                }
              >
                <Book className="h-5 w-5" />
                {!collapsed && <span className="ml-3">Knowledge Base</span>}
              </NavLink>
              <NavLink
                to="/admin/audit-logs"
                className={({ isActive }) =>
                  cn(
                    "flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground",
                    collapsed && "justify-center px-0"
                  )
                }
              >
                <FileText className="h-5 w-5" />
                {!collapsed && <span className="ml-3">Audit Logs</span>}
              </NavLink>
              <NavLink
                to="/admin/settings"
                className={({ isActive }) =>
                  cn(
                    "flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground",
                    collapsed && "justify-center px-0"
                  )
                }
              >
                <Settings className="h-5 w-5" />
                {!collapsed && <span className="ml-3">Settings</span>}
              </NavLink>
            </nav>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default AdminSidebar;
