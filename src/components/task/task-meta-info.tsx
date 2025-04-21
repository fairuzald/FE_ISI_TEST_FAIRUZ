"use client";

import { Badge } from "@/components/ui/badge";
import { P, Small } from "@/components/ui/typography";
import { formatRelativeTime } from "@/lib/utils";
import { Calendar, Clock, User, Users } from "lucide-react";

interface TaskAssignee {
  id: number;
  name: string;
  email: string;
}

interface TaskCreator {
  id: number;
  name: string;
  email: string;
}

interface TaskMetaInfoProps {
  createdBy: TaskCreator;
  assignees?: TaskAssignee[];
  createdAt: string;
  updatedAt: string;
}

export function TaskMetaInfo({
  createdBy,
  assignees = [],
  createdAt,
  updatedAt,
}: TaskMetaInfoProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-6">
      <div className="bg-gray-50 dark:bg-transparent p-3 rounded-md border border-gray-200 dark:border-gray-700">
        <Small className="font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
          <User size={14} />
          Created By
        </Small>
        <P className="text-gray-600 dark:text-gray-400">{createdBy.name}</P>
      </div>

      <div className="bg-gray-50 dark:bg-transparent p-3 rounded-md border border-gray-200 dark:border-gray-700">
        <Small className="font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
          <Users size={14} />
          Assigned To
        </Small>
        {assignees && assignees.length > 0 ? (
          <div className="flex flex-wrap gap-1 mt-1">
            {assignees.map((assignee) => (
              <Badge
                key={assignee.id}
                variant="primary"
                className="text-xs py-0.5"
              >
                {assignee.name}
              </Badge>
            ))}
          </div>
        ) : (
          <P className="text-gray-600 dark:text-gray-400 italic">Unassigned</P>
        )}
      </div>

      <div className="bg-gray-50 dark:bg-transparent p-3 rounded-md border border-gray-200 dark:border-gray-700">
        <Small className="font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
          <Calendar size={14} />
          Created
        </Small>
        <P className="text-gray-600 dark:text-gray-400">
          {formatRelativeTime(new Date(createdAt))}
        </P>
      </div>

      <div className="bg-gray-50 dark:bg-transparent p-3 rounded-md border border-gray-200 dark:border-gray-700">
        <Small className="font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
          <Clock size={14} />
          Last Updated
        </Small>
        <P className="text-gray-600 dark:text-gray-400">
          {formatRelativeTime(new Date(updatedAt))}
        </P>
      </div>
    </div>
  );
}
