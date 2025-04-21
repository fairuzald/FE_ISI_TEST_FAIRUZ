"use client";

import { ActivityLogSection } from "@/components/task/activity-log";
import { TaskDescription } from "@/components/task/task-description";
import { TaskHeader } from "@/components/task/task-header";
import { TaskMetaInfo } from "@/components/task/task-meta-info";
import { TaskTitle } from "@/components/task/task-title";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { TaskStatus } from "@/lib/db";
import { AlertCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface ActivityLog {
  id: number;
  taskId: number;
  userId: number;
  action: string;
  details: string;
  formattedDetails?: string;
  previousValue: string | null;
  newValue: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  affectedUser?: {
    id: number;
    name: string;
    email: string;
  };
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
  activityLogs: ActivityLog[];
}

export default function TaskDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const taskId = params.id as string;

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          throw new Error("Failed to fetch user");
        }
        const data = await res.json();
        setCurrentUser(data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
        showToast({
          type: "error",
          title: "Authentication Error",
          message: "Please try logging in again.",
        });
        router.push("/auth/login");
      }
    };

    fetchUser();
  }, [router, showToast]);
  const fetchTask = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/tasks/${taskId}`);

      if (!res.ok) {
        if (res.status === 404) {
          showToast({
            type: "error",
            title: "Task Not Found",
            message: "The requested task does not exist.",
          });
          router.push("/");
          return;
        }

        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch task");
      }

      const data = await res.json();

      if (!data.task) {
        throw new Error("Task data is missing");
      }

      setTask(data.task);
    } catch (error) {
      console.error("Error fetching task:", error);
      setError((error as Error).message || "Failed to load task details");
      showToast({
        type: "error",
        title: "Error Loading Task",
        message: (error as Error).message || "Failed to load task details",
      });
    } finally {
      setLoading(false);
    }
  }, [router, showToast, taskId]);

  useEffect(() => {
    if (currentUser) {
      fetchTask();
    }
  }, [currentUser, fetchTask, taskId]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return Promise.resolve();
    }

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete task");
      }

      showToast({
        type: "success",
        title: "Task Deleted",
        message: "The task has been successfully deleted.",
      });

      router.push("/");
      return Promise.resolve();
    } catch (err) {
      setError((err as Error).message);
      setIsDeleting(false);

      showToast({
        type: "error",
        title: "Delete Failed",
        message: (err as Error).message || "Failed to delete task",
      });

      return Promise.reject(err);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-r-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading user data...
          </p>
        </div>
      </div>
    );
  }

  const isLead = currentUser.role === "lead";
  const isAssignedToMe =
    task?.assignees?.some((a) => a.id === currentUser.id) ||
    task?.assignedToId === currentUser.id;
  const canEdit = isLead || isAssignedToMe;

  return (
    <>
      <TaskHeader
        taskId={taskId}
        isLead={isLead}
        canEdit={canEdit}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-md mb-6 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {loading ? (
        <Card className="text-center py-12 bg-white dark:bg-gray-800 shadow-md">
          <CardContent>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-r-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading task details...
            </p>
          </CardContent>
        </Card>
      ) : task ? (
        <div>
          <Card className="bg-white dark:bg-gray-800 shadow-md mb-6">
            <CardContent className="p-6">
              <TaskTitle
                title={task.title}
                status={task.status as TaskStatus}
              />
              <TaskDescription description={task.description} />
              <TaskMetaInfo
                createdBy={task.createdBy}
                assignees={task.assignees}
                createdAt={task.createdAt}
                updatedAt={task.updatedAt}
              />
            </CardContent>
          </Card>

          {/* Activity logs section */}
          <ActivityLogSection activityLogs={task.activityLogs || []} />
        </div>
      ) : (
        <Card className="text-center py-12 bg-white dark:bg-gray-800 shadow-md">
          <CardContent>
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Task not found or you don&apos;t have permission to view it
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
