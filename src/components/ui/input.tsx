"use client";

import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { forwardRef, InputHTMLAttributes, ReactNode, useState } from "react";
import { Label } from "./typography";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: string;
  fullWidth?: boolean;
  icon?: ReactNode;
  helpText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
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
    const inputId =
      id ||
      (typeof label === "string"
        ? label?.toLowerCase().replace(/\s+/g, "-")
        : undefined);

    const baseStyles =
      "block rounded-md border px-3 py-2 text-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors";

    const normalBorder = "border-gray-300 dark:border-gray-600";
    const errorBorder =
      "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500 focus:ring-red-500 dark:focus:ring-red-500";

    const widthStyles = fullWidth ? "w-full" : "";
    const iconStyles = icon ? "pl-10" : "";

    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    return (
      <div className={cn("mb-4", fullWidth && "w-full")}>
        {label && (
          <Label htmlFor={inputId} className="mb-1 block">
            {label}
          </Label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 dark:text-gray-400">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              baseStyles,
              error ? errorBorder : normalBorder,
              widthStyles,
              iconStyles,
              className,
              props.type === "password" && "pr-10"
            )}
            {...props}
            type={
              showPassword && props.type === "password" ? "text" : props.type
            }
          />
          {props.type === "password" && (
            <button
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400"
              type="button"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeOff
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <Eye
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </button>
          )}
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

Input.displayName = "Input";
