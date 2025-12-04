// Server-side admin auth utilities
import { getCurrentUser, JWTPayload } from "./auth";
import { hasPermission, isAdminRole } from "./admin-auth";

// Re-export client-safe functions
export { hasPermission, hasAnyPermission, hasAllPermissions, isAdminRole, getRolePermissions, ADMIN_ROLES } from "./admin-auth";
export type { AdminRole } from "./admin-auth";

// Get current admin user (server-side only)
export async function getAdminUser(): Promise<JWTPayload | null> {
  const user = await getCurrentUser();
  
  if (!user) return null;
  if (user.type !== "admin") return null;
  if (!isAdminRole(user.role)) return null;
  
  return user;
}

// Require admin authentication (throws if not authenticated)
export async function requireAdmin(): Promise<JWTPayload> {
  const user = await getAdminUser();
  
  if (!user) {
    throw new Error("Admin authentication required");
  }
  
  return user;
}

// Require specific permission (throws if not authorized)
export async function requirePermission(permission: string): Promise<JWTPayload> {
  const user = await requireAdmin();
  
  if (!hasPermission(user.role, permission)) {
    throw new Error(`Permission denied: ${permission}`);
  }
  
  return user;
}
