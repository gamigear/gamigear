import { NextRequest, NextResponse } from "next/server";
import { verifyToken, JWTPayload } from "./auth";
import { hasPermission, isAdminRole } from "./admin-auth";

export interface AuthResult {
  success: boolean;
  user?: JWTPayload;
  error?: string;
}

/**
 * Verify authentication from request
 * Returns user payload if authenticated, null otherwise
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  const token = request.cookies.get("auth_token")?.value;
  
  if (!token) {
    return { success: false, error: "Authentication required" };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return { success: false, error: "Invalid or expired token" };
  }

  return { success: true, user: payload };
}

/**
 * Verify admin authentication
 * Checks if user is authenticated AND has admin role
 */
export async function verifyAdminAuth(request: NextRequest): Promise<AuthResult> {
  const result = await verifyAuth(request);
  
  if (!result.success) {
    return result;
  }

  if (result.user?.type !== "admin" || !isAdminRole(result.user.role)) {
    return { success: false, error: "Admin access required" };
  }

  return result;
}

/**
 * Verify admin has specific permission
 */
export async function verifyPermission(
  request: NextRequest,
  permission: string
): Promise<AuthResult> {
  const result = await verifyAdminAuth(request);
  
  if (!result.success) {
    return result;
  }

  if (!hasPermission(result.user!.role, permission)) {
    return { success: false, error: `Permission denied: ${permission}` };
  }

  return result;
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(message = "Unauthorized"): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Create forbidden response
 */
export function forbiddenResponse(message = "Forbidden"): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * Higher-order function to wrap API routes with auth check
 */
export function withAuth<T extends any[]>(
  handler: (request: NextRequest, user: JWTPayload, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const result = await verifyAuth(request);
    
    if (!result.success) {
      return unauthorizedResponse(result.error);
    }

    return handler(request, result.user!, ...args);
  };
}

/**
 * Higher-order function to wrap API routes with admin auth check
 */
export function withAdminAuth<T extends any[]>(
  handler: (request: NextRequest, user: JWTPayload, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const result = await verifyAdminAuth(request);
    
    if (!result.success) {
      return result.error === "Admin access required" 
        ? forbiddenResponse(result.error)
        : unauthorizedResponse(result.error);
    }

    return handler(request, result.user!, ...args);
  };
}

/**
 * Higher-order function to wrap API routes with permission check
 */
export function withPermission<T extends any[]>(
  permission: string,
  handler: (request: NextRequest, user: JWTPayload, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const result = await verifyPermission(request, permission);
    
    if (!result.success) {
      if (result.error?.startsWith("Permission denied")) {
        return forbiddenResponse(result.error);
      }
      return unauthorizedResponse(result.error);
    }

    return handler(request, result.user!, ...args);
  };
}
