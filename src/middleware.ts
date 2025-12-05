import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Paths that require admin authentication
const adminPublicPaths = ["/admin/login"];

// Paths that require customer authentication
const customerProtectedPaths = ["/mypage", "/settings"];

// Admin roles allowed
const adminRoles = ["administrator", "admin", "shop_manager", "editor"];

// Get JWT secret as Uint8Array for jose library
function getJWTSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || "dev-only-secret-do-not-use-in-production";
  return new TextEncoder().encode(secret);
}

// Verify JWT token properly with signature validation
async function verifyJWT(token: string): Promise<{
  valid: boolean;
  payload?: { userId: string; email: string; role: string; type: string; exp?: number };
}> {
  try {
    const { payload } = await jwtVerify(token, getJWTSecret());
    return {
      valid: true,
      payload: payload as { userId: string; email: string; role: string; type: string; exp?: number },
    };
  } catch {
    return { valid: false };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get("auth_token")?.value;

  // Add security headers to all responses
  const response = NextResponse.next();
  
  // Check if it's an admin route
  if (pathname.startsWith("/admin")) {
    // Allow access to login page without auth
    if (adminPublicPaths.some(path => pathname === path)) {
      // If already logged in, redirect to admin dashboard
      if (authToken) {
        const result = await verifyJWT(authToken);
        if (result.valid && result.payload?.type === "admin") {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      }
      return response;
    }

    // For other admin routes, check authentication
    if (!authToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Verify JWT with proper signature validation
    const result = await verifyJWT(authToken);
    
    if (!result.valid || !result.payload) {
      // Invalid token, redirect to login and clear cookie
      const redirectResponse = NextResponse.redirect(new URL("/admin/login", request.url));
      redirectResponse.cookies.delete("auth_token");
      return redirectResponse;
    }

    const { payload } = result;

    // Check if token is for admin
    if (payload.type !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Check if user has admin role
    if (!adminRoles.includes(payload.role)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return response;
  }

  // Check customer protected routes
  if (customerProtectedPaths.some(path => pathname.startsWith(path))) {
    if (!authToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify customer token
    const result = await verifyJWT(authToken);
    if (!result.valid) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const redirectResponse = NextResponse.redirect(loginUrl);
      redirectResponse.cookies.delete("auth_token");
      return redirectResponse;
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/mypage/:path*",
    "/settings/:path*",
  ],
};
