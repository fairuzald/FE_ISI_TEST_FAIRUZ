"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { forwardRef, ReactNode, SelectHTMLAttributes } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
  options: SelectOption[];
  error?: string;
  fullWidth?: boolean;
  icon?: ReactNode;
  helpText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      helpText,
      className,
      fullWidth = false,
      id,
      icon,
      ...props
    },
    ref
  ) => {
    const selectId =
      id ||
      (typeof label === "string"
        ? label?.toLowerCase().replace(/\s+/g, "-")
        : undefined);

    const baseStyles =
      "block appearance-none rounded-md border px-3 py-2 pr-8 text-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors";

    const normalBorder = "border-gray-300 dark:border-gray-600";
    const errorBorder =
      "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500 focus:ring-red-500 dark:focus:ring-red-500";

    const widthStyles = fullWidth ? "w-full" : "";
    const iconStyles = icon ? "pl-10" : "";

    return (
      <div className={cn("mb-4 relative", fullWidth && "w-full")}>
        {label && (
          <label htmlFor={selectId} className="mb-1 block">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 dark:text-gray-400">
              {icon}
            </div>
          )}
          <select
            id={selectId}
            ref={ref}
            className={cn(
              baseStyles,
              error ? errorBorder : normalBorder,
              widthStyles,
              iconStyles,
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center px-2 text-gray-700 dark:text-gray-300">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
        {helpText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
