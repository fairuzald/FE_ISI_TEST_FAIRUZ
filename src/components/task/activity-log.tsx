"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { P, Small } from "@/components/ui/typography";
import { formatRelativeTime } from "@/lib/utils";
import {
  Activity,
  Edit2,
  FileText,
  PencilLine,
  RotateCcw,
  Trash2,
  UserPlus,
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
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
  user: User;
  affectedUser?: User;
}

interface ActivityLogSectionProps {
  activityLogs: ActivityLog[];
}

export function ActivityLogSection({ activityLogs }: ActivityLogSectionProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case "create":
        return <FileText size={14} className="mr-1" />;
      case "update":
        return <PencilLine size={14} className="mr-1" />;
      case "delete":
        return <Trash2 size={14} className="mr-1" />;
      case "status_change":
        return <RotateCcw size={14} className="mr-1" />;
      case "assign":
        return <UserPlus size={14} className="mr-1" />;
      default:
        return <Edit2 size={14} className="mr-1" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "create":
        return "bg-green-100 dark:bg-green-900/20";
      case "update":
        return "bg-blue-100 dark:bg-blue-900/20";
      case "delete":
        return "bg-red-100 dark:bg-red-900/20";
      case "status_change":
        return "bg-purple-100 dark:bg-purple-900/20";
      case "assign":
        return "bg-indigo-100 dark:bg-indigo-900/20";
      default:
        return "bg-gray-100 dark:bg-gray-900/20";
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity size={18} className="text-blue-500" />
          Activity History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activityLogs && activityLogs.length > 0 ? (
          <div className="space-y-4">
            {activityLogs.map((log) => (
              <div
                key={log.id}
                className="border-l-2 border-gray-200 dark:border-gray-700 pl-4 py-1 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                <div className="flex items-center mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {log.user.name}
                  </span>
                  <span className="mx-2 text-gray-400">•</span>
                  <Small className="text-gray-500 dark:text-gray-400">
                    {formatRelativeTime(new Date(log.createdAt))}
                  </Small>
                </div>

                <div className="flex items-center">
                  <span
                    className={`p-1 rounded-full ${getActionColor(
                      log.action
                    )} mr-2`}
                  >
                    {getActionIcon(log.action)}
                  </span>

                  <Small className="text-gray-600 dark:text-gray-400">
                    {log.formattedDetails || log.details}
                  </Small>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <P className="text-gray-600 dark:text-gray-400 text-sm">
            No activity recorded yet.
          </P>
        )}
      </CardContent>
    </Card>
  );
}
