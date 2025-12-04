"use client";

import { ReactNode } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { ShieldAlert, Lock } from "lucide-react";

interface PermissionGuardProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean; // If true, requires all permissions; if false, requires any
  fallback?: ReactNode;
  showError?: boolean;
}

export default function PermissionGuard({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback,
  showError = true,
}: PermissionGuardProps) {
  const { user, loading, hasPermission, hasAnyPermission } = useAdminAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    if (fallback) return <>{fallback}</>;
    if (!showError) return null;
    
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Lock className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Authentication Required
        </h3>
        <p className="text-gray-500">
          Please log in to access this content.
        </p>
      </div>
    );
  }

  // Check single permission
  if (permission && !hasPermission(permission)) {
    if (fallback) return <>{fallback}</>;
    if (!showError) return null;
    
    return <PermissionDenied permission={permission} />;
  }

  // Check multiple permissions
  if (permissions.length > 0) {
    const hasAccess = requireAll
      ? permissions.every(p => hasPermission(p))
      : hasAnyPermission(permissions);

    if (!hasAccess) {
      if (fallback) return <>{fallback}</>;
      if (!showError) return null;
      
      return <PermissionDenied permissions={permissions} requireAll={requireAll} />;
    }
  }

  return <>{children}</>;
}

// Permission denied component
function PermissionDenied({
  permission,
  permissions,
  requireAll,
}: {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
}) {
  const permissionList = permission ? [permission] : permissions || [];
  
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-lg border border-red-200">
      <ShieldAlert className="w-12 h-12 text-red-400 mb-4" />
      <h3 className="text-lg font-medium text-red-900 mb-2">
        Permission Denied
      </h3>
      <p className="text-red-600 mb-4">
        You don't have permission to access this content.
      </p>
      {permissionList.length > 0 && (
        <div className="text-sm text-red-500">
          <p className="mb-2">
            Required permission{permissionList.length > 1 ? "s" : ""}:
          </p>
          <ul className="list-disc list-inside">
            {permissionList.map((p) => (
              <li key={p} className="font-mono">{p}</li>
            ))}
          </ul>
          {permissionList.length > 1 && (
            <p className="mt-2 text-xs">
              ({requireAll ? "All permissions required" : "Any permission required"})
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// HOC for wrapping pages with permission check
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission: string
) {
  return function WrappedComponent(props: P) {
    return (
      <PermissionGuard permission={permission}>
        <Component {...props} />
      </PermissionGuard>
    );
  };
}

// Hook for checking permissions in components
export function usePermission(permission: string): boolean {
  const { hasPermission } = useAdminAuth();
  return hasPermission(permission);
}

// Hook for checking multiple permissions
export function usePermissions(
  permissions: string[],
  requireAll = false
): boolean {
  const { hasPermission, hasAnyPermission } = useAdminAuth();
  
  if (requireAll) {
    return permissions.every(p => hasPermission(p));
  }
  return hasAnyPermission(permissions);
}
