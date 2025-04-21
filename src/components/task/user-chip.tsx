"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, getInitials } from "@/lib/utils";
import { Check, ChevronDown, UserPlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

export interface UserAssignmentSelectProps {
  label?: string;
  users: User[];
  selectedUserIds: string[];
  onChange: (selectedIds: string[]) => void;
  className?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  isLoading?: boolean;
  onBlur?: () => void;
}

export function UserAssignmentSelect({
  label = "Assign Users",
  users,
  selectedUserIds,
  onChange,
  className,
  placeholder = "Select users to assign...",
  error,
  disabled = false,
  required = false,
  isLoading = false,
  onBlur,
}: UserAssignmentSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedUsers = users.filter((user) =>
    selectedUserIds.includes(user.id.toString())
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
        if (onBlur) onBlur();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onBlur]);

  const toggleUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      onChange(selectedUserIds.filter((id) => id !== userId));
    } else {
      onChange([...selectedUserIds, userId]);
    }
  };

  const removeUser = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    onChange(selectedUserIds.filter((id) => id !== userId));
  };

  return (
    <div className={cn("mb-4 space-y-1.5", className)} ref={containerRef}>
      {label && (
        <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
          <UserPlus size={14} />
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Filter chip */}
      <div
        className={cn(
          "relative w-full cursor-pointer",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "flex min-h-10 w-full flex-wrap items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm",
            isOpen &&
              "border-blue-500 ring-1 ring-blue-500 dark:border-blue-400 dark:ring-blue-400",
            error && "border-red-500 dark:border-red-500",
            "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
            "transition-all duration-200"
          )}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          tabIndex={0}
        >
          <div className="flex flex-1 flex-wrap gap-1.5 py-0.5">
            {selectedUsers.length === 0 ? (
              <span className="text-gray-500 dark:text-gray-400">
                {isLoading ? "Loading users..." : placeholder}
              </span>
            ) : (
              selectedUsers.map((user) => (
                <Badge
                  key={user.id}
                  variant="primary"
                  className="flex items-center gap-1 pl-1 py-0.5 pr-0.5"
                >
                  <Avatar
                    className="h-5 w-5 text-[10px]"
                    name={user.name}
                    initials={getInitials(user.name)}
                  />
                  <span className="px-1">{user.name}</span>
                  {!disabled && (
                    <button
                      onClick={(e) => removeUser(e, user.id.toString())}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-blue-600/20 focus:bg-blue-600/20 focus:outline-none"
                      type="button"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {user.name}</span>
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
            className="absolute z-[1000] top-10 mt-1 max-h-[400px] w-full overflow-auto rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-1 shadow-lg"
            style={{ visibility: "visible", display: "block" }}
          >
            {isLoading ? (
              <div className="px-3 py-2 text-center">
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] text-blue-500"></div>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  Loading users...
                </span>
              </div>
            ) : users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user.id}
                  className={cn(
                    "flex items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer",
                    selectedUserIds.includes(user.id.toString()) &&
                      "bg-blue-50 dark:bg-blue-900/30"
                  )}
                  onClick={() => toggleUser(user.id.toString())}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-gray-300 dark:border-gray-600",
                      selectedUserIds.includes(user.id.toString()) &&
                        "border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400"
                    )}
                  >
                    {selectedUserIds.includes(user.id.toString()) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar
                      className="h-6 w-6 text-xs"
                      name={user.name}
                      initials={getInitials(user.name)}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-center text-sm text-gray-500 dark:text-gray-400">
                No users available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
