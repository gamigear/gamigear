import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that require admin authentication
const adminPaths = ["/admin"];
const adminPublicPaths = ["/admin/login"];

// Paths that require customer authentication
const customerProtectedPaths = ["/mypage", "/settings"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get("auth_token")?.value;

  // Check if it's an admin route
  if (pathname.startsWith("/admin")) {
    // Allow access to login page without auth
    if (adminPublicPaths.some(path => pathname === path)) {
      // If already logged in, redirect to admin dashboard
      if (authToken) {
        try {
          // Decode JWT to check if admin
          const payload = JSON.parse(
            Buffer.from(authToken.split(".")[1], "base64").toString()
          );
          if (payload.type === "admin") {
            return NextResponse.redirect(new URL("/admin", request.url));
          }
        } catch {
          // Invalid token, allow access to login
        }
      }
      return NextResponse.next();
    }

    // For other admin routes, check authentication
    if (!authToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      // Decode JWT to verify admin type
      const payload = JSON.parse(
        Buffer.from(authToken.split(".")[1], "base64").toString()
      );

      // Check if token is for admin
      if (payload.type !== "admin") {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }

      // Check if user has admin role
      const adminRoles = ["administrator", "shop_manager", "editor"];
      if (!adminRoles.includes(payload.role)) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }

      // Check token expiration
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        const response = NextResponse.redirect(new URL("/admin/login", request.url));
        response.cookies.delete("auth_token");
        return response;
      }

      return NextResponse.next();
    } catch {
      // Invalid token, redirect to login
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete("auth_token");
      return response;
    }
  }

  // Check customer protected routes
  if (customerProtectedPaths.some(path => pathname.startsWith(path))) {
    if (!authToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/mypage/:path*",
    "/settings/:path*",
  ],
};
