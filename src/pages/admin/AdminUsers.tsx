
// The function uses 'success' variant for buttons which doesn't exist
// Let's modify only those specific parts to use 'secondary' instead

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { 
  Search, 
  MoreVertical, 
  UserPlus, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Shield, 
  User as UserIcon, 
  AlertTriangle, 
  Loader2 
} from "lucide-react";
import { mockUsers } from "@/data/mockData";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types";

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all-users");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const highlightedUserId = searchParams.get("id");
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        
        // Fetch users from Supabase
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (error) {
          throw error;
        }
        
        if (data) {
          // Format the data to match our User type
          const formattedUsers: User[] = data.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            createdAt: u.created_at,
            isVerified: u.is_verified || false,
            isActive: true,
          }));
          
          setUsers(formattedUsers);
          setFilteredUsers(formattedUsers);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Failed to load users",
          description: "There was an error loading user data.",
          variant: "destructive",
        });
        
        // Fallback to mock data
        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  useEffect(() => {
    filterUsers(activeTab, searchTerm);
  }, [searchTerm, activeTab, users]);
  
  const filterUsers = (tab: string, search: string) => {
    let filtered = [...users];
    
    // Apply tab filter
    switch (tab) {
      case "admins":
        filtered = filtered.filter(user => user.role === "admin");
        break;
      case "clients":
        filtered = filtered.filter(user => user.role === "user");
        break;
      case "verified":
        filtered = filtered.filter(user => user.isVerified);
        break;
      case "unverified":
        filtered = filtered.filter(user => !user.isVerified);
        break;
      default:
        // "all-users" - no filter
        break;
    }
    
    // Apply search filter
    if (search.trim() !== "") {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchLower) || 
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredUsers(filtered);
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const makeAdmin = async (userId: string) => {
    try {
      // Update user role in Supabase
      const { error } = await supabase
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", userId);
        
      if (error) throw error;
      
      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === userId ? { ...u, role: "admin" } : u
        )
      );
      
      toast({
        title: "Role Updated",
        description: "User has been promoted to admin.",
      });
      
    } catch (error) {
      console.error("Error making user admin:", error);
      toast({
        title: "Update Failed",
        description: "Could not update user role.",
        variant: "destructive",
      });
    }
  };
  
  const removeAdmin = async (userId: string) => {
    try {
      // Update user role in Supabase
      const { error } = await supabase
        .from("profiles")
        .update({ role: "user" })
        .eq("id", userId);
        
      if (error) throw error;
      
      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === userId ? { ...u, role: "user" } : u
        )
      );
      
      toast({
        title: "Role Updated",
        description: "User has been changed to regular user.",
      });
      
    } catch (error) {
      console.error("Error removing admin role:", error);
      toast({
        title: "Update Failed",
        description: "Could not update user role.",
        variant: "destructive",
      });
    }
  };
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          View and manage user accounts
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
        <Button className="whitespace-nowrap" onClick={() => console.log("Invite user")}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="all-users" value={activeTab} onValueChange={handleTabChange}>
          <div className="px-6">
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="all-users">All Users</TabsTrigger>
              <TabsTrigger value="admins">Admins</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
              <TabsTrigger value="unverified">Unverified</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all-users" className="m-0">
            <CardContent>
              <UserTable 
                users={filteredUsers} 
                makeAdmin={makeAdmin} 
                removeAdmin={removeAdmin} 
                formatDate={formatDate}
                highlightedUserId={highlightedUserId}
                currentUserId={currentUser?.id}
              />
            </CardContent>
          </TabsContent>
          
          <TabsContent value="admins" className="m-0">
            <CardContent>
              <UserTable 
                users={filteredUsers} 
                makeAdmin={makeAdmin} 
                removeAdmin={removeAdmin} 
                formatDate={formatDate}
                highlightedUserId={highlightedUserId}
                currentUserId={currentUser?.id}
              />
            </CardContent>
          </TabsContent>
          
          <TabsContent value="clients" className="m-0">
            <CardContent>
              <UserTable 
                users={filteredUsers} 
                makeAdmin={makeAdmin} 
                removeAdmin={removeAdmin} 
                formatDate={formatDate}
                highlightedUserId={highlightedUserId}
                currentUserId={currentUser?.id}
              />
            </CardContent>
          </TabsContent>
          
          <TabsContent value="verified" className="m-0">
            <CardContent>
              <UserTable 
                users={filteredUsers} 
                makeAdmin={makeAdmin} 
                removeAdmin={removeAdmin} 
                formatDate={formatDate}
                highlightedUserId={highlightedUserId}
                currentUserId={currentUser?.id}
              />
            </CardContent>
          </TabsContent>
          
          <TabsContent value="unverified" className="m-0">
            <CardContent>
              <UserTable 
                users={filteredUsers} 
                makeAdmin={makeAdmin} 
                removeAdmin={removeAdmin} 
                formatDate={formatDate}
                highlightedUserId={highlightedUserId}
                currentUserId={currentUser?.id}
              />
            </CardContent>
          </TabsContent>
        </Tabs>
        
        <CardFooter className="border-t bg-muted/50 p-4">
          <div className="text-xs text-muted-foreground">
            Last updated: {new Date().toLocaleString()}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

interface UserTableProps {
  users: User[];
  makeAdmin: (userId: string) => void;
  removeAdmin: (userId: string) => void;
  formatDate: (date: string) => string;
  highlightedUserId: string | null;
  currentUserId?: string;
}

const UserTable = ({ 
  users, 
  makeAdmin, 
  removeAdmin, 
  formatDate,
  highlightedUserId,
  currentUserId
}: UserTableProps) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No users found</p>
      </div>
    );
  }
  
  return (
    <div className="border rounded-md">
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 text-left font-medium">User</th>
              <th className="h-12 px-4 text-left font-medium">Role</th>
              <th className="h-12 px-4 text-left font-medium">Status</th>
              <th className="h-12 px-4 text-left font-medium">Joined</th>
              <th className="h-12 px-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr 
                key={user.id} 
                className={`border-b transition-colors hover:bg-muted/50 ${
                  highlightedUserId === user.id ? 'bg-primary/10' : ''
                }`}
              >
                <td className="p-4 align-middle">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 align-middle">
                  <div className="flex items-center gap-2">
                    {user.role === "admin" ? (
                      <>
                        <Shield className="h-4 w-4 text-primary" />
                        <span>Admin</span>
                      </>
                    ) : (
                      <>
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <span>User</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="p-4 align-middle">
                  {user.isVerified ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-secondary" />
                      <span>Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span>Unverified</span>
                    </div>
                  )}
                </td>
                <td className="p-4 align-middle">
                  {formatDate(user.createdAt)}
                </td>
                <td className="p-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem 
                        onClick={() => console.log("View user details:", user.id)}
                      >
                        <UserIcon className="mr-2 h-4 w-4" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => console.log("Send email to:", user.email)}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {user.role !== "admin" ? (
                        <DropdownMenuItem 
                          onClick={() => makeAdmin(user.id)}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Make Admin
                        </DropdownMenuItem>
                      ) : user.id !== currentUserId ? (
                        <DropdownMenuItem 
                          onClick={() => removeAdmin(user.id)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Remove Admin Rights
                        </DropdownMenuItem>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
