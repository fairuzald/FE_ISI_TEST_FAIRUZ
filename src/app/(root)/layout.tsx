"use client";

import { Navbar } from "@/components/navbar";
import { useToast } from "@/components/ui/toast";
import { User } from "@/lib/db";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
        showToast({
          type: "error",
          title: "Authentication Error",
          message: "Failed to authenticate user. Please try logging in again.",
        });
        router.push("/auth/login");
      }
    };

    fetchUser();
  }, [router, showToast]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
