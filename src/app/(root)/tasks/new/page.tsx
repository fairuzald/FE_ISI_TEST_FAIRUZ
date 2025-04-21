"use client";

import { UserAssignmentSelect } from "@/components/task/user-chip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { H1 } from "@/components/ui/typography";
import { taskFormSchema, TaskFormValues } from "@/schemas/task.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  FileText,
  PlusCircle,
  Save,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function CreateTaskPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [teamUsers, setTeamUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "not_started",
      assignedToIds: [],
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();

        if (data.user.role !== "lead") {
          showToast({
            type: "error",
            title: "Access Denied",
            message: "Only team leads can create tasks.",
          });
          router.push("/");
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
        showToast({
          type: "error",
          title: "Authentication Error",
          message: "Please log in again to continue.",
        });
        router.push("/auth/login");
      }
    };

    fetchUser();
  }, [router, showToast]);

  const fetchUsers = useCallback(async () => {
    try {
      setFetchingUsers(true);
      const res = await fetch("/api/users?role=team");
      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      setTeamUsers(data.users || []);
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
      fetchUsers();
    }
  }, [user, fetchUsers]);

  useEffect(() => {
    setValue("assignedToIds", selectedAssignees);
  }, [selectedAssignees, setValue]);

  const onSubmit = async (data: TaskFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!data.title.trim()) {
        throw new Error("Task title is required");
      }

      const payload = {
        ...data,
        assignedToIds: selectedAssignees,
      };

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const responseData = await res.json();
        throw new Error(responseData.error || "Failed to create task");
      }

      showToast({
        type: "success",
        title: "Task Created",
        message: "Your task has been created successfully.",
      });

      router.push("/");
    } catch (err) {
      setError((err as Error).message);
      showToast({
        type: "error",
        title: "Error",
        message: (err as Error).message,
      });
    } finally {
      setIsLoading(false);
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

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <H1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
          <PlusCircle size={28} className="text-blue-600" />
          Create New Task
        </H1>

        <Link href="/">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            leftIcon={<ArrowLeft size={16} />}
          >
            Cancel
          </Button>
        </Link>
      </div>

      <Card className="bg-white dark:bg-gray-800 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Task Details</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-md text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Title input */}
            <Input
              label={
                <span className="flex items-center gap-2">
                  <FileText size={14} />
                  Title
                </span>
              }
              error={errors.title?.message}
              fullWidth
              className="mb-4"
              {...register("title")}
              placeholder="Enter task title..."
              required
            />

            {/* Descripttion */}
            <div className="mb-4">
              <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <FileText size={14} />
                Description
              </label>
              <textarea
                className={`block w-full rounded-md border ${
                  errors.description
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                } px-3 py-2 text-sm focus:outline-none focus:ring-1 bg-transparent text-gray-900 dark:text-gray-100`}
                rows={4}
                {...register("description")}
                placeholder="Add a detailed description of the task..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Status */}
            <Select
              label={
                <span className="flex items-center gap-2">
                  <User size={14} />
                  Status
                </span>
              }
              options={[
                { value: "not_started", label: "Not Started" },
                { value: "on_progress", label: "In Progress" },
                { value: "done", label: "Done" },
                { value: "reject", label: "Rejected" },
              ]}
              error={errors.status?.message}
              fullWidth
              className="mb-4"
              {...register("status")}
            />

            {/* Assignent */}
            <UserAssignmentSelect
              label="Assign to Team Members"
              users={teamUsers}
              selectedUserIds={selectedAssignees}
              onChange={setSelectedAssignees}
              placeholder="Select team members to assign..."
              isLoading={fetchingUsers}
              className="mb-6"
              error={errors.assignedToIds?.message}
            />

            {/* Create task button */}
            <Button
              type="submit"
              variant="gradient"
              isLoading={isLoading}
              fullWidth
              className="flex items-center gap-2 justify-center shadow-md"
              leftIcon={<Save size={16} />}
            >
              Create Task
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
