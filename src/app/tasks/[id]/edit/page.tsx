"use client";

import { Navbar } from "@/components/navbar";
import { TaskHeader } from "@/components/task/task-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { H3 } from "@/components/ui/typography";
import { taskFormSchema, TaskFormValues } from "@/schemas/task.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  FileText,
  PencilLine,
  Save,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  createdById: number;
  assignedToId: number | null;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  assignedTo: User | null;
  assignees: User[];
}

export default function TaskEditPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const { showToast } = useToast();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [taskUsers, setTaskUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
      assignedToId: "",
      assignedToIds: [],
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setCurrentUser(data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/auth/login");
      }
    };

    fetchUser();
  }, [router]);
  const fetchTask = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      if (!res.ok) {
        if (res.status === 404) {
          router.push("/dashboard");
          return;
        }
        throw new Error("Failed to fetch task");
      }

      const data = await res.json();
      setTask(data.task);
    } catch (error) {
      console.error("Error fetching task:", error);
      setError("Failed to load task details");
    } finally {
      setLoading(false);
    }
  }, [router, taskId]);
  useEffect(() => {
    if (currentUser) {
      fetchTask();
      if (currentUser.role === "lead") {
        fetchUsers();
      }
    }
  }, [currentUser, fetchTask, taskId]);

  useEffect(() => {
    if (task) {
      setValue("title", task.title);
      setValue("description", task.description || "");
      setValue(
        "status",
        task.status as "not_started" | "on_progress" | "done" | "reject"
      );
      setValue(
        "assignedToId",
        task.assignedToId ? task.assignedToId.toString() : ""
      );

      if (task.assignees?.length > 0) {
        const assigneeIds = task.assignees.map((a) => a.id.toString());
        setSelectedAssignees(assigneeIds);
        setValue("assignedToIds", assigneeIds);
      }
    }
  }, [task, setValue]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users?role=team");
      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      setTaskUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const onSubmit = async (data: TaskFormValues) => {
    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        ...data,
        assignedToId: data.assignedToId ? parseInt(data.assignedToId) : null,
        assignedToIds: selectedAssignees.map((id) => parseInt(id)),
      };

      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Failed to update task");
      }

      showToast({
        type: "success",
        title: "Task Updated",
        message: "Task has been updated successfully.",
      });

      router.push(`/tasks/${taskId}`);
    } catch (err) {
      setError((err as Error).message);
      showToast({
        type: "error",
        title: "Error",
        message: (err as Error).message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/tasks/${taskId}`);
  };

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

  const isLead = currentUser.role === "lead";
  const isAssignedToMe =
    task?.assignees?.some((a) => a.id === currentUser.id) ||
    task?.assignedToId === currentUser.id;
  const canEdit = isLead || isAssignedToMe;

  // Check authorization
  if (!canEdit && !loading && task) {
    router.push(`/tasks/${taskId}`);
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar user={currentUser} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TaskHeader
          taskId={taskId}
          isLead={false}
          canEdit={false}
          backTo={`/tasks/${taskId}`}
        />

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
                Loading task details...
              </p>
            </CardContent>
          </Card>
        ) : task ? (
          <Card className="bg-white dark:bg-gray-800 shadow-md mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PencilLine size={20} className="text-blue-500" />
                Edit Task
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)}>
                {!isLead ? (
                  <div className="mb-4">
                    <H3 className="mb-2 text-gray-900 dark:text-gray-100">
                      {task.title}
                    </H3>
                    <div className="h-1 w-16 bg-blue-500 rounded"></div>
                  </div>
                ) : (
                  <Input
                    label="Title"
                    error={errors.title?.message}
                    fullWidth
                    className="mb-4"
                    icon={<FileText size={16} />}
                    {...register("title")}
                  />
                )}

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
                    } px-3 py-2 text-sm focus:outline-none focus:ring-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`}
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

                {isLead && (
                  <div className="mb-6">
                    <MultiSelect
                      label={
                        <span className="flex items-center gap-2">
                          <UserPlus size={14} />
                          Assign to Team Members
                        </span>
                      }
                      options={taskUsers.map((user) => ({
                        value: user.id.toString(),
                        label: user.name,
                      }))}
                      selectedValues={selectedAssignees}
                      onChange={setSelectedAssignees}
                      fullWidth
                      error={errors.assignedToIds?.message}
                      placeholder="Select team members to assign..."
                    />
                  </div>
                )}

                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    className="flex items-center gap-2"
                    leftIcon={<X size={16} />}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="gradient"
                    isLoading={isSaving}
                    className="flex items-center gap-2"
                    leftIcon={<Save size={16} />}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : null}
      </main>
    </div>
  );
}
