"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge, BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Small, Typography } from "@/components/ui/typography";
import { TaskStatus } from "@/lib/db/schema";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import {
  Calendar,
  Check,
  ChevronDown,
  Circle,
  Clock,
  Edit,
  Eye,
  RotateCcw,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdById: number;
  assignedToId: number | null;
  createdAt: string;
  updatedAt: string;
  assignedTo?: User | null;
  createdBy?: User;
  assignees?: User[];
}

interface TaskCardProps {
  task: Task;
  isLead: boolean;
  currentUserId: number;
}

export function TaskCard({ task, isLead, currentUserId }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllAssignees, setShowAllAssignees] = useState(false);

  const statusLabels: Record<TaskStatus, string> = {
    not_started: "Not Started",
    on_progress: "In Progress",
    done: "Done",
    reject: "Rejected",
  };

  const statusColors: Record<TaskStatus, BadgeVariant> = {
    not_started: "default",
    on_progress: "primary",
    done: "success",
    reject: "danger",
  };

  const StatusIcon = ({ status }: { status: TaskStatus }) => {
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

  const isAssignedToMe =
    task.assignees?.some((a) => a.id === currentUserId) ||
    task.assignedToId === currentUserId;

  const assignees = task.assignees || [];
  const displayAssignees = showAllAssignees ? assignees : assignees.slice(0, 3);
  const hasMoreAssignees = assignees.length > 3;

  return (
    <Card
      variant={task.status === "done" ? "gradient" : "default"}
      className="group h-full flex flex-col transition-all duration-200 hover:shadow-md"
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
            {task.title}
          </CardTitle>
          <Badge
            variant={statusColors[task.status]}
            className="flex items-center whitespace-nowrap"
          >
            <StatusIcon status={task.status} />
            {statusLabels[task.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-grow pt-2">
        {task.description ? (
          <div className="mb-4">
            {isExpanded || task.description.length < 100 ? (
              <Typography className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-line">
                {task.description}
              </Typography>
            ) : (
              <>
                <Typography className="text-gray-600 dark:text-gray-400 text-sm">
                  {task.description.substring(0, 100)}...
                </Typography>
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-blue-600 dark:text-blue-400 text-xs mt-1 hover:underline flex items-center"
                >
                  <ChevronDown size={12} className="mr-1" />
                  Show more
                </button>
              </>
            )}
          </div>
        ) : (
          <Typography className="text-gray-500 dark:text-gray-400 text-sm italic mb-4">
            No description provided
          </Typography>
        )}

        {/* Assignees */}
        {assignees.length > 0 && (
          <div className="mb-3">
            <Small className="text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1.5">
              <Users size={14} />
              Assigned to:
            </Small>
            <div className="flex flex-wrap gap-1.5">
              {displayAssignees.map((assignee) => (
                <Badge
                  key={assignee.id}
                  variant="primary"
                  className="flex items-center gap-1 pl-1 py-0.5 text-xs"
                >
                  <Avatar
                    className="h-4 w-4 text-[8px]"
                    name={assignee.name}
                    initials={getInitials(assignee.name)}
                  />
                  <span className="px-1">{assignee.name}</span>
                </Badge>
              ))}

              {hasMoreAssignees && !showAllAssignees && (
                <button
                  onClick={() => setShowAllAssignees(true)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                >
                  +{assignees.length - 3} more
                </button>
              )}

              {showAllAssignees && hasMoreAssignees && (
                <button
                  onClick={() => setShowAllAssignees(false)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                >
                  Show less
                </button>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400 mt-4">
          <div className="flex items-center">
            <Clock size={14} className="mr-2 text-gray-400" />
            <Small className="whitespace-nowrap">
              {formatRelativeTime(new Date(task.createdAt))}
            </Small>
          </div>

          <div className="flex items-center">
            <Calendar size={14} className="mr-2 text-gray-400" />
            <Small className="whitespace-nowrap">
              {new Date(task.updatedAt).toLocaleDateString()}
            </Small>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-2 border-t border-gray-200 dark:border-gray-700 pt-3 dark:bg-transparent">
        <Link href={`/tasks/${task.id}`}>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 shadow-sm"
            leftIcon={<Eye size={14} />}
          >
            View
          </Button>
        </Link>

        {(isLead || isAssignedToMe) && (
          <Link href={`/tasks/${task.id}/edit`}>
            <Button
              variant={isLead ? "gradient" : "primary"}
              size="sm"
              className="flex items-center gap-1 shadow-sm"
              leftIcon={<Edit size={14} />}
            >
              {isLead ? "Manage" : "Update"}
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
