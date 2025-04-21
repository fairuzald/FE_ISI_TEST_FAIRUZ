"use client";

import { Badge } from "@/components/ui/badge";
import { getStatusLabel } from "@/lib/utils";
import { Check, Circle, RotateCcw, X } from "lucide-react";

type TaskStatus = "not_started" | "on_progress" | "done" | "reject";

interface TaskStatusBadgeProps {
  status: TaskStatus;
  withIcon?: boolean;
  className?: string;
}

export function TaskStatusBadge({
  status,
  withIcon = true,
  className,
}: TaskStatusBadgeProps) {
  const StatusIcon = () => {
    switch (status) {
      case "not_started":
        return <Circle size={14} className="mr-1" />;
      case "on_progress":
        return <RotateCcw size={14} className="mr-1" />;
      case "done":
        return <Check size={14} className="mr-1" />;
      case "reject":
        return <X size={14} className="mr-1" />;
      default:
        return null;
    }
  };

  const variant =
    status === "not_started"
      ? "default"
      : status === "on_progress"
      ? "primary"
      : status === "done"
      ? "success"
      : "danger";

  return (
    <Badge variant={variant} className={`flex items-center ${className || ""}`}>
      {withIcon && <StatusIcon />}
      {getStatusLabel(status)}
    </Badge>
  );
}
