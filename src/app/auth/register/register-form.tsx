"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, User, UserCog } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  registerFormSchema,
  RegisterFormValues,
} from "../../../schemas/register.schema";

export default function RegisterForm() {
  const router = useRouter();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "team",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const response = await fetch("/api/auth", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to register");
      }

      showToast({
        title: "Registration successful",
        message: "You can now log in to your account.",
        type: "success",
      });

      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err) {
      showToast({
        title: "Registration failed",
        message: (err as Error).message,
        type: "error",
      });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* FUll name */}
        <Input
          type="text"
          label="Full Name"
          error={errors.name?.message}
          fullWidth
          icon={<User className="h-4 w-4" />}
          placeholder="John Doe"
          {...register("name")}
        />

        {/* Email */}
        <Input
          type="email"
          label="Email"
          error={errors.email?.message}
          fullWidth
          icon={<Mail className="h-4 w-4" />}
          placeholder="test@email.com"
          {...register("email")}
        />

        {/* Password */}
        <Input
          type={"password"}
          label="Password"
          error={errors.password?.message}
          fullWidth
          icon={<Lock className="h-4 w-4" />}
          placeholder="••••••••"
          {...register("password")}
        />

        {/* Confirm Password */}
        <Input
          type="password"
          label="Confirm Password"
          error={errors.confirmPassword?.message}
          fullWidth
          className="mb-6"
          icon={<Lock className="h-4 w-4" />}
          placeholder="••••••••"
          {...register("confirmPassword")}
        />

        {/* Role */}
        <div className="mb-6">
          <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
            <UserCog className="h-4 w-4" />
            Role
          </label>

          <div className="flex gap-2 items-center">
            <div className="flex items-center">
              <input
                type="radio"
                id="team"
                value="team"
                {...register("role")}
                className="mr-2"
              />
              <label
                htmlFor="team"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                Team
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="radio"
                id="lead"
                value="lead"
                {...register("role")}
                className="mr-2"
              />
              <label
                htmlFor="lead"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                Lead
              </label>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant="gradient"
          isLoading={isSubmitting}
          fullWidth
          className="shadow-md"
        >
          Create Account
        </Button>
      </form>
    </>
  );
}
