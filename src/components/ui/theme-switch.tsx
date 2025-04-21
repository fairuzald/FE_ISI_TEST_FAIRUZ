"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "@/providers/theme-provider";
import { Moon, Sun } from "lucide-react";

interface ThemeSwitchProps {
  className?: string;
}

export function ThemeSwitch({ className }: ThemeSwitchProps) {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
        "hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200",
        "focus:outline-none focus:ring-2 focus:ring-blue-500",
        className
      )}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}
