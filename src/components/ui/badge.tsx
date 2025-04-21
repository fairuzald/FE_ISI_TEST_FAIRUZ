"use client";

import { cn } from "@/lib/utils";
import React from "react";

export type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "gradient";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", children, className, ...props }, ref) => {
    const variantClasses: Record<BadgeVariant, string> = {
      default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      primary: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      success:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      warning:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      danger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      info: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      gradient:
        "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900 dark:to-indigo-900 dark:text-blue-300",
    };

    const baseClasses =
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors";

    return (
      <span
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
