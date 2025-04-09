
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { Search, MoreVertical, UserCheck, UserMinus, ShieldCheck, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  is_verified: boolean;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState("");
  const { toast } = useToast();

  // Fetch users from Supabase
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      toast({
        title: "Role updated",
        description: `User role has been updated to ${newRole}`,
      });
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleVerificationChange = async (userId: string, isVerified: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_verified: isVerified })
        .eq("id", userId);

      if (error) throw error;

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, is_verified: isVerified } : user
        )
      );

      toast({
        title: isVerified ? "User verified" : "User unverified",
        description: `User has been ${isVerified ? "verified" : "unverified"}`,
      });
    } catch (error: any) {
      console.error("Error updating verification status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update verification status",
        variant: "destructive",
      });
    }
  };

  const handleUserAction = (user: UserProfile, action: string) => {
    setSelectedUser(user);
    setDialogAction(action);
    setDialogOpen(true);
  };

  const confirmUserAction = async () => {
    if (!selectedUser) return;

    try {
      switch (dialogAction) {
        case "makeAdmin":
          await handleRoleChange(selectedUser.id, "admin");
          break;
        case "removeAdmin":
          await handleRoleChange(selectedUser.id, "user");
          break;
        case "verify":
          await handleVerificationChange(selectedUser.id, true);
          break;
        case "unverify":
          await handleVerificationChange(selectedUser.id, false);
          break;
        default:
          break;
      }
    } finally {
      setDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage user accounts and permissions
        </p>
      </div>

      <div className="mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Table>
        <TableCaption>
          {isLoading
            ? "Loading users..."
            : `Total ${filteredUsers.length} users`}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10">
                Loading users...
              </TableCell>
            </TableRow>
          ) : filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === "admin" ? "default" : "outline"}
                    className={
                      user.role === "admin"
                        ? "bg-blue-500 hover:bg-blue-600"
                        : ""
                    }
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.is_verified ? "default" : "outline"}
                    className={
                      user.is_verified
                        ? "bg-green-500 hover:bg-green-600"
                        : ""
                    }
                  >
                    {user.is_verified ? "Verified" : "Unverified"}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {user.role !== "admin" ? (
                        <DropdownMenuItem
                          onClick={() => handleUserAction(user, "makeAdmin")}
                        >
                          <ShieldCheck className="mr-2 h-4 w-4" /> Make Admin
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleUserAction(user, "removeAdmin")}
                        >
                          <Shield className="mr-2 h-4 w-4" /> Remove Admin Role
                        </DropdownMenuItem>
                      )}
                      {!user.is_verified ? (
                        <DropdownMenuItem
                          onClick={() => handleUserAction(user, "verify")}
                        >
                          <UserCheck className="mr-2 h-4 w-4" /> Verify User
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleUserAction(user, "unverify")}
                        >
                          <UserMinus className="mr-2 h-4 w-4" /> Unverify User
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "makeAdmin"
                ? "Make User Admin"
                : dialogAction === "removeAdmin"
                ? "Remove Admin Role"
                : dialogAction === "verify"
                ? "Verify User"
                : "Unverify User"}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === "makeAdmin"
                ? "This will grant admin privileges to this user."
                : dialogAction === "removeAdmin"
                ? "This will remove admin privileges from this user."
                : dialogAction === "verify"
                ? "This will mark the user as verified."
                : "This will mark the user as unverified."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to{" "}
              {dialogAction === "makeAdmin"
                ? "make"
                : dialogAction === "removeAdmin"
                ? "remove"
                : dialogAction === "verify"
                ? "verify"
                : "unverify"}{" "}
              {selectedUser?.name} ({selectedUser?.email})?
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={dialogAction.includes("Admin") ? "default" : "default"}
              onClick={confirmUserAction}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
