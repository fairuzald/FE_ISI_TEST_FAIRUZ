import * as jose from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { User } from "../db/schema";

const JWT_SECRET = process.env.JWT_SECRET || "default-ya";
const JWT_EXPIRES_IN = "24h";

type JwtPayload = {
  userId: number;
  email: string;
  role: string;
};

/**
 * Sign a JWT token with user data
 */
export async function signJwtToken(
  user: Pick<User, "id" | "email" | "role">
): Promise<string> {
  try {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const secretKey = new TextEncoder().encode(JWT_SECRET);

    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRES_IN)
      .sign(secretKey);

    return token;
  } catch (error) {
    console.error("Error signing JWT token:", error);
    throw new Error("Failed to create authentication token");
  }
}

/**
 * Verify a JWT token and return the decoded payload
 */
export async function verifyJwtToken(
  token: string
): Promise<JwtPayload | null> {
  if (!token || token.trim() === "") {
    console.error("Empty token provided to verifyJwtToken");
    return null;
  }

  try {
    const secretKey = new TextEncoder().encode(JWT_SECRET);

    const { payload } = await jose.jwtVerify(token, secretKey);

    if (!payload.userId || !payload.email || !payload.role) {
      console.error("Invalid payload structure in JWT token");
      return null;
    }

    return {
      userId: Number(payload.userId),
      email: String(payload.email),
      role: String(payload.role),
    };
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}

/**
 * Get JWT token from cookies
 */
export function getJwtToken(): string | null {
  try {
    const cookieStore = cookies();
    return cookieStore.get("token")?.value || null;
  } catch (error) {
    console.error("Error getting JWT token from cookies:", error);
    return null;
  }
}

/**
 * Set JWT cookie in response
 */
export function setJwtCookie(
  response: NextResponse,
  token: string
): NextResponse {
  response.cookies.set({
    name: "token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  return response;
}

/**
 * Clear JWT cookie
 */
export function clearJwtCookie(response: NextResponse): NextResponse {
  response.cookies.set({
    name: "token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });

  return response;
}

/**
 * Authentication middleware helper
 */
export async function withAuth(
  request: NextRequest,
  requireRole?: "lead" | "team"
): Promise<{ user: JwtPayload } | NextResponse> {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      console.log("No token found in cookies");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const payload = await verifyJwtToken(token);

    if (!payload) {
      console.log("Token verification failed");
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    if (requireRole && payload.role !== requireRole) {
      console.log(
        `Role ${requireRole} required, but user has role ${payload.role}`
      );
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    return { user: payload };
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}
