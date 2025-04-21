"use client";

import { cn } from "@/lib/utils";
import { Check, ChevronDown, X } from "lucide-react";
import { forwardRef, ReactNode, useEffect, useRef, useState } from "react";
import { Badge } from "./badge";
import { Label } from "./typography";

export interface SelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  label?: ReactNode;
  options: SelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  className?: string;
  placeholder?: string;
  error?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
}

export const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      label,
      options,
      selectedValues,
      onChange,
      className,
      placeholder = "Select options...",
      error,
      icon,
      fullWidth = false,
      disabled = false,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOptions = options.filter((option) =>
      selectedValues.includes(option.value)
    );

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const toggleOption = (value: string) => {
      if (selectedValues.includes(value)) {
        onChange(selectedValues.filter((v) => v !== value));
      } else {
        onChange([...selectedValues, value]);
      }
    };

    const removeOption = (e: React.MouseEvent, value: string) => {
      e.stopPropagation();
      onChange(selectedValues.filter((v) => v !== value));
    };

    return (
      <div
        className={cn("mb-4 relative", fullWidth && "w-full")}
        ref={containerRef}
      >
        {label && <Label className="mb-1 block">{label}</Label>}

        <div
          ref={ref}
          className={cn(
            "flex min-h-10 w-full flex-wrap items-center justify-between rounded-md border px-3 py-2 text-sm",
            isOpen
              ? "border-blue-500 ring-1 ring-blue-500 dark:border-blue-400 dark:ring-blue-400"
              : "border-gray-300 dark:border-gray-600",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500"
              : "",
            "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
            "focus:outline-none cursor-pointer transition-colors",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          tabIndex={0}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="flex flex-1 flex-wrap gap-1.5 py-0.5">
            {icon && (
              <div className="flex items-center text-gray-500 dark:text-gray-400 mr-2">
                {icon}
              </div>
            )}

            {selectedOptions.length === 0 ? (
              <span className="text-gray-500 dark:text-gray-400">
                {placeholder}
              </span>
            ) : (
              selectedOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant="primary"
                  className="flex items-center gap-1 pl-2 py-1"
                >
                  {option.label}
                  {!disabled && (
                    <button
                      onClick={(e) => removeOption(e, option.value)}
                      className="ml-1 rounded-full hover:bg-blue-600/20 focus:bg-blue-600/20 focus:outline-none"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {option.label}</span>
                    </button>
                  )}
                </Badge>
              ))
            )}
          </div>
          <div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </div>
        </div>

        {error && (
          <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}

        {isOpen && !disabled && (
          <div
            ref={dropdownRef}
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-1 shadow-lg"
            style={{ overflowY: "auto", visibility: "visible" }}
          >
            {options.length > 0 ? (
              options.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-center px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer",
                    selectedValues.includes(option.value) &&
                      "bg-blue-50 dark:bg-blue-900/30"
                  )}
                  onClick={() => toggleOption(option.value)}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-gray-300 dark:border-gray-600",
                      selectedValues.includes(option.value) &&
                        "border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400"
                    )}
                  >
                    {selectedValues.includes(option.value) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm">{option.label}</span>
                </div>
              ))
            ) : (
              <div className="px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                No options available
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

MultiSelect.displayName = "MultiSelect";
