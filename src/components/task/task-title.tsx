"use client";

import { TaskStatusBadge } from "@/components/task/task-status-badge";
import { H2 } from "@/components/ui/typography";
import { TaskStatus } from "@/lib/db";

interface TaskTitleProps {
  title: string;
  status: TaskStatus;
}

export function TaskTitle({ title, status }: TaskTitleProps) {
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <H2 className="mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {title}
        </H2>
        <div className="h-1 w-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded"></div>
      </div>
      <TaskStatusBadge status={status} />
    </div>
  );
}
