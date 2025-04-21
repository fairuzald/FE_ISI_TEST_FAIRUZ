"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { loginFormSchema, LoginFormValues } from "@/schemas/login.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, LogIn, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to login");
      }

      router.push("/");
      router.refresh();

      showToast({
        type: "success",
        title: "Login successful",
        message: "Welcome back!",
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Login failed",
        message: (err as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Email */}
      <Input
        type="email"
        label="Email"
        error={errors.email?.message}
        fullWidth
        className="mb-4"
        icon={<Mail className="h-4 w-4" />}
        placeholder="test@email.com"
        {...register("email")}
      />

      {/* Password */}
      <Input
        type="password"
        label="Password"
        error={errors.password?.message}
        fullWidth
        className="mb-6"
        icon={<Lock className="h-4 w-4" />}
        placeholder="••••••••"
        {...register("password")}
      />

      {/* Submit Button */}
      <Button
        type="submit"
        variant="gradient"
        isLoading={isLoading}
        fullWidth
        leftIcon={<LogIn size={16} />}
        className="shadow-md"
      >
        Sign In
      </Button>
    </form>
  );
}
