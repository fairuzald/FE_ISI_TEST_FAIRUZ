import { ThemeSwitch } from "@/components/ui/theme-switch";
import { H1, P } from "@/components/ui/typography";
import { ClipboardList } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import RegisterForm from "./register-form";

export const metadata: Metadata = {
  title: "Register",
  description: "Create an account to manage your tasks",
};

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md">
      <div className="flex justify-end mb-4">
        <ThemeSwitch />
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 border border-gray-200 dark:border-gray-700">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            {/* Icon */}
            {/* TODO: change app icon */}
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-md">
              <ClipboardList size={28} />
            </div>
          </div>
          <H1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Create an Account
          </H1>
          <P className="text-gray-600 dark:text-gray-400">
            Sign up to start managing tasks
          </P>
        </div>

        {/* Form */}
        <RegisterForm />

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
