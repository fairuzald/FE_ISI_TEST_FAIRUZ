"use client";

import { Button } from "@/components/ui/button";
import { Small, Typography } from "@/components/ui/typography";
import { getInitials } from "@/lib/utils";
import { ClipboardList, LogOut, Menu, Shield, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ThemeSwitch } from "./ui/theme-switch";

interface NavbarProps {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isLead = user.role === "lead";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth", {
        method: "DELETE",
      });
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md flex items-center justify-center text-white shadow-md">
                <ClipboardList size={20} />
              </div>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Task Manager
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden gap-4">
            <ThemeSwitch className="mr-2 h-fit m-auto" />

            <button
              type="button"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            {/* User management */}
            <div className="flex items-center space-x-4">
              {isLead && (
                <Link
                  href="/users"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 gap-2 transition-all duration-300"
                >
                  <Shield size={16} className="text-blue-500" />
                  User Management
                </Link>
              )}

              <ThemeSwitch className="mr-2 h-fit m-auto" />

              {/* Profile */}
              <div className="relative group">
                <div className="flex items-center gap-2 px-3 py-2 ">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
                    {getInitials(user.name)}
                  </div>
                  <div className="flex flex-col">
                    <Typography className="text-sm font-medium">
                      {user.name}
                    </Typography>
                    <Small className="text-gray-500 dark:text-gray-400 capitalize">
                      {user.role}
                    </Small>
                  </div>
                </div>
              </div>

              {/* Logout */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                isLoading={isLoggingOut}
                className="flex gap-2 items-center"
                leftIcon={<LogOut size={16} />}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}

      {isMenuOpen && (
        <div className="lg:hidden">
          <div className="pt-2 pb-3 space-y-1 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col items-center p-4 space-y-4">
              {isLead && (
                <Link
                  href="/users"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 gap-2 transition-all duration-300"
                >
                  <Shield size={16} className="text-blue-500" />
                  User Management
                </Link>
              )}

              <div className="flex items-center gap-2 w-full p-3 rounded-md bg-gray-50 dark:bg-gray-700">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {getInitials(user.name)}
                </div>
                <div className="flex flex-col">
                  <Typography className="text-sm font-medium">
                    {user.name}
                  </Typography>
                  <Small className="text-gray-500 dark:text-gray-400 capitalize">
                    {user.role}
                  </Small>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                isLoading={isLoggingOut}
                className="w-full flex gap-2 items-center justify-center"
                leftIcon={<LogOut size={16} />}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
