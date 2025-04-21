import { cn } from "@/lib/utils";
import React from "react";

export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function Loader({
  size = "md",
  text,
  className,
  ...props
}: LoaderProps) {
  const sizeStyles = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className={cn("flex flex-col items-center", className)} {...props}>
      <div
        className={cn(
          "animate-spin rounded-full border-solid border-blue-600 border-r-transparent dark:border-blue-500",
          sizeStyles[size]
        )}
      />
      {text && <p className="mt-4 text-gray-600 dark:text-gray-400">{text}</p>}
    </div>
  );
}
