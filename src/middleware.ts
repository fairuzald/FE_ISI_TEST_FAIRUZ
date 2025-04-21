import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyJwtToken } from "./lib/auth/jwt";

// Paths that are publicly accessible without authentication
const publicPaths = ["/auth/login", "/auth/register", "/", "/api/auth"];

// Asset paths that should be excluded from auth checks
const assetPaths = [
  "/_next/",
  "/favicon.ico",
  "/images/",
  "/fonts/",
  "/api/health",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    publicPaths.some(
      (path) => pathname === path || pathname.startsWith(path)
    ) ||
    assetPaths.some((path) => pathname.includes(path))
  ) {
    return NextResponse.next();
  }

  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      console.log(`No token found, redirecting to login from: ${pathname}`);

      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    const payload = await verifyJwtToken(token);

    if (!payload) {
      console.log(`Invalid token, redirecting to login from: ${pathname}`);

      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Invalid or expired token" },
          { status: 401 }
        );
      }

      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("error", "session_expired");
      return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/admin") && payload.role !== "lead") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 }
        );
      }

      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware authentication error:", error);

    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 500 }
      );
    }

    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("error", "auth_error");
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
