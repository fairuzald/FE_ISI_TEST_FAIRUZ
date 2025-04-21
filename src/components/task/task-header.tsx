"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft, PencilLine, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TaskHeaderProps {
  taskId: string;
  isLead: boolean;
  canEdit: boolean;
  backTo?: string;
  onDelete?: () => Promise<void>;
  isDeleting?: boolean;
}

export function TaskHeader({
  taskId,
  isLead,
  canEdit,
  backTo = "/",
  onDelete,
  isDeleting = false,
}: TaskHeaderProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      if (onDelete) {
        await onDelete();
      } else {
        const res = await fetch(`/api/tasks/${taskId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to delete task");
        }
      }

      showToast({
        type: "success",
        title: "Task Deleted",
        message: "The task has been successfully deleted.",
      });

      router.push("/");
    } catch (err) {
      showToast({
        type: "error",
        title: "Error",
        message: (err as Error).message || "Failed to delete task",
      });
    }
  };

  return (
    <div className="mb-6 flex items-center justify-between">
      <Link href={backTo}>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          leftIcon={<ArrowLeft size={16} />}
        >
          {backTo === "/" ? "Back to Dashboard" : "Back"}
        </Button>
      </Link>

      <div className="flex gap-3">
        {canEdit && (
          <Link href={`/tasks/${taskId}/edit`}>
            <Button
              variant="primary"
              size="sm"
              className="flex items-center gap-2"
              leftIcon={<PencilLine size={16} />}
            >
              Edit Task
            </Button>
          </Link>
        )}

        {isLead && (
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
            className="flex items-center gap-2"
            leftIcon={<Trash2 size={16} />}
          >
            Delete Task
          </Button>
        )}
      </div>
    </div>
  );
}
