import { compare, hash } from "bcrypt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { User } from "../db/schema";
import { verifyJwtToken } from "./jwt";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

export const getCurrentUser = cache(
  async (): Promise<{
    userId: number;
    email: string;
    role: string;
  } | null> => {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return null;
    }

    try {
      const user = await verifyJwtToken(token);
      return user;
    } catch (error) {
      console.error("Error in getCurrentUser:", error);
      return null;
    }
  }
);

export async function requireAuth(redirectTo = "/auth/login") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(redirectTo);
  }

  return user;
}

export async function requireRole(
  role: "lead" | "team",
  redirectTo = "/dashboard"
) {
  const user = await requireAuth();

  if (user.role !== role) {
    redirect(redirectTo);
  }

  return user;
}

export function isLead(user: Pick<User, "role">): boolean {
  return user.role === "lead";
}

export function isTeam(user: Pick<User, "role">): boolean {
  return user.role === "team";
}
