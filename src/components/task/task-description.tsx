"use client";

import { H5, P } from "@/components/ui/typography";
import { FileText } from "lucide-react";

interface TaskDescriptionProps {
  description: string | null;
}

export function TaskDescription({ description }: TaskDescriptionProps) {
  return (
    <div className="mb-6">
      <H5 className="mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <FileText size={16} />
        Description
      </H5>
      <div className="bg-gray-50 dark:bg-transparent p-4 rounded-md border border-gray-200 dark:border-gray-700">
        <P className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
          {description || "No description provided"}
        </P>
      </div>
    </div>
  );
}
