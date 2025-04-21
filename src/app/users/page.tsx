"use client";

import { Navbar } from "@/components/navbar";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { H1, P } from "@/components/ui/typography";
import { getInitials } from "@/lib/utils";
import {
  AlertCircle,
  Edit2,
  Filter,
  RefreshCw,
  Save,
  Search,
  Shield,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UserManagementPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editingUserRole, setEditingUserRole] = useState<string>("");

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await res.json();
        setCurrentUser(data.user);

        if (data.user.role !== "lead") {
          showToast({
            type: "error",
            title: "Access Denied",
            message: "Only team leads can access user management.",
          });
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
        showToast({
          type: "error",
          title: "Authentication Error",
          message: "Please log in again to continue.",
        });
        router.push("/auth/login");
      }
    };

    fetchCurrentUser();
  }, [router, showToast]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/users");
      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again.");
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to load users.",
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (currentUser && currentUser.role === "lead") {
      fetchUsers();
    }
  }, [currentUser, fetchUsers]);

  const startEditing = (user: UserData) => {
    setEditingUserId(user.id);
    setEditingUserRole(user.role);
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setEditingUserRole("");
  };

  const saveUserRole = async (userId: number) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: editingUserRole,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update user");
      }

      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: editingUserRole } : user
        )
      );

      showToast({
        type: "success",
        title: "User Updated",
        message: "User role has been updated successfully.",
      });

      cancelEditing();
    } catch (error) {
      console.error("Error updating user:", error);
      showToast({
        type: "error",
        title: "Update Failed",
        message: (error as Error).message || "Failed to update user role.",
      });
    }
  };

  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      if (a.role !== b.role) {
        return a.role === "lead" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-r-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar user={currentUser} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <H1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
              <Shield className="text-blue-600" size={28} />
              User Management
            </H1>
            <P className="text-gray-600 dark:text-gray-400 mt-1">
              {loading
                ? "Loading users..."
                : `${filteredUsers.length} users found`}
            </P>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-grow sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search users..."
                className="w-full	"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select
              options={[
                { label: "All Roles", value: "all" },
                { label: "Lead", value: "lead" },
                { label: "Team", value: "team" },
              ]}
              icon={<Filter size={16} />}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-40"
            />

            <Button
              variant="secondary"
              size="md"
              onClick={fetchUsers}
              className="flex-grow-0 flex items-center gap-2"
              leftIcon={<RefreshCw size={16} />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-md mb-6 flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {loading ? (
          <Card className="text-center py-12 bg-white dark:bg-gray-800">
            <CardContent>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-r-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading users...
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">User List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-gray-200 dark:hover:bg-gray-750 transition-colors"
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Avatar
                                className="h-8 w-8 flex-shrink-0 mr-3"
                                name={user.name}
                                initials={getInitials(user.name)}
                              />
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {user.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                            {user.email}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {editingUserId === user.id ? (
                              <Select
                                options={[
                                  { label: "Lead", value: "lead" },
                                  { label: "Team", value: "team" },
                                ]}
                                value={editingUserRole}
                                onChange={(e) =>
                                  setEditingUserRole(e.target.value)
                                }
                                className="w-28"
                              />
                            ) : (
                              <Badge
                                variant={
                                  user.role === "lead" ? "gradient" : "primary"
                                }
                                className="capitalize"
                              >
                                {user.role}
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                            {editingUserId === user.id ? (
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={cancelEditing}
                                  leftIcon={<X size={14} />}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => saveUserRole(user.id)}
                                  leftIcon={<Save size={14} />}
                                >
                                  Save
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startEditing(user)}
                                leftIcon={<Edit2 size={14} />}
                                disabled={
                                  user.id === currentUser.id ||
                                  user.role === "lead"
                                }
                              >
                                Edit Role
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                          colSpan={5}
                        >
                          No users found matching your search criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
