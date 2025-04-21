"use client";

import { Navbar } from "@/components/navbar";
import { Task, TaskCard } from "@/components/task/task-card";
import { UserAssignmentSelect } from "@/components/task/user-chip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MultiSelect } from "@/components/ui/multi-select";
import { useToast } from "@/components/ui/toast";
import { H1, H3, H5, P, Small } from "@/components/ui/typography";
import {
  CheckCircle2,
  Circle,
  Filter,
  PlusCircle,
  RefreshCw,
  SearchX,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    notStarted: 0,
    inProgress: 0,
    done: 0,
    rejected: 0,
  });

  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [assigneeFilters, setAssigneeFilters] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const statusOptions = [
    { id: "not_started", value: "not_started", label: "Not Started" },
    { id: "on_progress", value: "on_progress", label: "In Progress" },
    { id: "done", value: "done", label: "Done" },
    { id: "reject", value: "reject", label: "Rejected" },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
        setError("Failed to authenticate user. Please try logging in again.");
        showToast({
          type: "error",
          title: "Authentication Error",
          message: "Failed to authenticate user. Please try logging in again.",
        });
      }
    };

    fetchUser();
  }, [showToast]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = "/api/tasks";
      const params = new URLSearchParams();

      if (statusFilters.length > 0) {
        statusFilters.forEach((status) => {
          params.append("status", status);
        });
      }

      if (assigneeFilters.length > 0) {
        assigneeFilters.forEach((assignee) => {
          params.append("assignedTo", assignee);
        });
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch tasks");
      }

      const data = await res.json();

      if (!data.tasks || !Array.isArray(data.tasks)) {
        setTasks([]);
        setTaskStats({
          total: 0,
          notStarted: 0,
          inProgress: 0,
          done: 0,
          rejected: 0,
        });
        return;
      }

      setTasks(data.tasks);

      calculateTaskStats(data.tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError((error as Error).message || "Failed to load tasks");
      showToast({
        type: "error",
        title: "Error",
        message: (error as Error).message || "Failed to load tasks",
      });
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilters, assigneeFilters, showToast]);

  const calculateTaskStats = (taskList: Task[]) => {
    const stats = {
      total: taskList.length,
      notStarted: 0,
      inProgress: 0,
      done: 0,
      rejected: 0,
    };

    taskList.forEach((task) => {
      if (task.status === "not_started") stats.notStarted++;
      else if (task.status === "on_progress") stats.inProgress++;
      else if (task.status === "done") stats.done++;
      else if (task.status === "reject") stats.rejected++;
    });

    setTaskStats(stats);
  };

  const fetchUsers = useCallback(async () => {
    try {
      setFetchingUsers(true);
      const res = await fetch("/api/users?role=team");
      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to load team members",
      });
    } finally {
      setFetchingUsers(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (user) {
      fetchTasks();
      if (user.role === "lead") {
        fetchUsers();
      }
    }
  }, [user, statusFilters, assigneeFilters, fetchTasks, fetchUsers]);

  const clearFilters = () => {
    setStatusFilters([]);
    setAssigneeFilters([]);
  };

  const handleStatusFilterChange = (selected: string[]) => {
    setStatusFilters(selected);
  };

  const handleAssigneeFilterChange = (selected: string[]) => {
    setAssigneeFilters(selected);
  };

  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleRefresh = () => {
    fetchTasks();
    if (user?.role === "lead") {
      fetchUsers();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-r-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const isLead = user.role === "lead";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <H1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {isLead ? "Manage Tasks" : "My Tasks"}
            </H1>
            <P className="text-gray-600 dark:text-gray-400 mt-1">
              {loading
                ? "Loading tasks..."
                : `${taskStats.total} task${
                    taskStats.total !== 1 ? "s" : ""
                  } in total`}
            </P>
          </div>

          <div className="flex gap-4 self-stretch sm:self-auto w-full sm:w-auto">
            {isLead && (
              <Link href="/tasks/new" className="flex-grow sm:flex-grow-0">
                <Button
                  variant="gradient"
                  size="md"
                  fullWidth
                  className="flex items-center gap-2 shadow-md"
                  leftIcon={<PlusCircle size={16} />}
                >
                  Create New Task
                </Button>
              </Link>
            )}

            <Button
              variant="secondary"
              size="md"
              onClick={handleRefresh}
              className="flex-grow-0 flex items-center gap-2"
              leftIcon={<RefreshCw size={16} />}
            >
              Refresh
            </Button>

            <Button
              variant={isFilterOpen ? "primary" : "outline"}
              size="md"
              onClick={toggleFilters}
              className="flex-grow-0 flex items-center gap-2"
              leftIcon={<Filter size={16} />}
            >
              Filters
              {(statusFilters.length > 0 || assigneeFilters.length > 0) && (
                <span className="ml-1.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-0.5 rounded-full">
                  {statusFilters.length + assigneeFilters.length}
                </span>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-md mb-6 flex items-center gap-2">
            <XCircle size={16} />
            {error}
          </div>
        )}

        {/* Filter Panel */}
        {isFilterOpen && (
          <Card className="mb-6 bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700">
            <CardContent className="p-5">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <H5>Filter Tasks</H5>
                  {(statusFilters.length > 0 || assigneeFilters.length > 0) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="flex items-center gap-2"
                      leftIcon={<X size={14} />}
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status Filter */}
                  <div>
                    <MultiSelect
                      label={
                        <span className="flex items-center gap-2">
                          <Filter size={14} />
                          Filter by Status
                        </span>
                      }
                      options={statusOptions.map((user) => ({
                        value: user.value,
                        label: user.label,
                      }))}
                      selectedValues={statusFilters}
                      onChange={handleStatusFilterChange}
                      fullWidth
                      placeholder="Select team members to assign..."
                    />
                  </div>

                  {/* Assignee Filter - Only for leads */}
                  {isLead && (
                    <div>
                      <UserAssignmentSelect
                        label="Filter by Assignee"
                        users={users}
                        selectedUserIds={assigneeFilters}
                        onChange={handleAssigneeFilterChange}
                        placeholder="Select team members to filter..."
                        isLoading={fetchingUsers}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Task Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Circle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-3">
                  <Small className="text-gray-500 dark:text-gray-400">
                    Not Started
                  </Small>
                  <H5 className="text-gray-900 dark:text-gray-100 mt-1">
                    {taskStats.notStarted}
                  </H5>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <RefreshCw className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-3">
                  <Small className="text-gray-500 dark:text-gray-400">
                    In Progress
                  </Small>
                  <H5 className="text-gray-900 dark:text-gray-100 mt-1">
                    {taskStats.inProgress}
                  </H5>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-3">
                  <Small className="text-gray-500 dark:text-gray-400">
                    Completed
                  </Small>
                  <H5 className="text-gray-900 dark:text-gray-100 mt-1">
                    {taskStats.done}
                  </H5>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-3">
                  <Small className="text-gray-500 dark:text-gray-400">
                    Rejected
                  </Small>
                  <H5 className="text-gray-900 dark:text-gray-100 mt-1">
                    {taskStats.rejected}
                  </H5>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task List */}
        {loading ? (
          <Card className="text-center py-12 bg-white dark:bg-gray-800">
            <CardContent>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-r-transparent mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading tasks...
              </p>
            </CardContent>
          </Card>
        ) : tasks.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 p-12 text-center">
            <CardContent>
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <SearchX className="h-8 w-8 text-gray-500 dark:text-gray-400" />
              </div>
              <H3 className="text-gray-900 dark:text-gray-100 mb-2">
                No tasks found
              </H3>
              <P className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {statusFilters.length > 0 || assigneeFilters.length > 0
                  ? "No tasks match your current filters. Try adjusting your filters or create a new task."
                  : "You don't have any tasks yet."}
              </P>
              {isLead && (
                <Link href="/tasks/new">
                  <Button
                    variant="gradient"
                    size="md"
                    className="flex items-center gap-2 mx-auto shadow-md"
                    leftIcon={<PlusCircle size={16} />}
                  >
                    Create your first task
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isLead={isLead}
                currentUserId={user.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
