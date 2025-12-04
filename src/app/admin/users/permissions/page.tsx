"use client";

import { useState } from "react";
import { Shield, ShieldCheck, ShieldAlert, Info } from "lucide-react";
import { ADMIN_ROLES, getRolePermissions, AdminRole } from "@/lib/admin-auth";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

// Group permissions by category
const permissionGroups = {
  "Products": ["products.view", "products.create", "products.edit", "products.delete"],
  "Orders": ["orders.view", "orders.edit", "orders.delete"],
  "Customers": ["customers.view", "customers.edit", "customers.delete"],
  "Coupons": ["coupons.view", "coupons.create", "coupons.edit", "coupons.delete"],
  "Reviews": ["reviews.view", "reviews.edit", "reviews.delete"],
  "Media": ["media.view", "media.upload", "media.delete"],
  "Reports": ["reports.view", "reports.export"],
  "Posts": ["posts.view", "posts.create", "posts.edit", "posts.delete"],
  "Pages": ["pages.view", "pages.create", "pages.edit", "pages.delete"],
  "Categories": ["categories.view", "categories.create", "categories.edit", "categories.delete"],
  "Settings": ["settings.view", "settings.edit"],
  "Users": ["users.view", "users.create", "users.edit", "users.delete"],
};

const permissionLabels: Record<string, string> = {
  "products.view": "View Products",
  "products.create": "Create Products",
  "products.edit": "Edit Products",
  "products.delete": "Delete Products",
  "orders.view": "View Orders",
  "orders.edit": "Edit Orders",
  "orders.delete": "Delete Orders",
  "customers.view": "View Customers",
  "customers.edit": "Edit Customers",
  "customers.delete": "Delete Customers",
  "coupons.view": "View Coupons",
  "coupons.create": "Create Coupons",
  "coupons.edit": "Edit Coupons",
  "coupons.delete": "Delete Coupons",
  "reviews.view": "View Reviews",
  "reviews.edit": "Edit Reviews",
  "reviews.delete": "Delete Reviews",
  "media.view": "View Media",
  "media.upload": "Upload Media",
  "media.delete": "Delete Media",
  "reports.view": "View Reports",
  "reports.export": "Export Reports",
  "posts.view": "View Posts",
  "posts.create": "Create Posts",
  "posts.edit": "Edit Posts",
  "posts.delete": "Delete Posts",
  "pages.view": "View Pages",
  "pages.create": "Create Pages",
  "pages.edit": "Edit Pages",
  "pages.delete": "Delete Pages",
  "categories.view": "View Categories",
  "categories.create": "Create Categories",
  "categories.edit": "Edit Categories",
  "categories.delete": "Delete Categories",
  "settings.view": "View Settings",
  "settings.edit": "Edit Settings",
  "users.view": "View Users",
  "users.create": "Create Users",
  "users.edit": "Edit Users",
  "users.delete": "Delete Users",
};

export default function PermissionsPage() {
  const { user } = useAdminAuth();
  const [selectedRole, setSelectedRole] = useState<AdminRole>("administrator");

  const roles = Object.keys(ADMIN_ROLES).filter(r => r !== "customer") as AdminRole[];
  const rolePermissions = getRolePermissions(selectedRole);

  const hasPermission = (permission: string) => {
    if (selectedRole === "administrator") return true;
    return rolePermissions.includes(permission);
  };

  const getRoleIcon = (role: AdminRole) => {
    switch (role) {
      case "administrator":
        return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case "shop_manager":
        return <ShieldCheck className="w-5 h-5 text-blue-500" />;
      case "editor":
        return <Shield className="w-5 h-5 text-green-500" />;
      default:
        return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Role Permissions</h1>
        <p className="text-gray-500 mt-1">
          View and understand the permissions assigned to each admin role
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Permissions are predefined for each role and cannot be modified individually.
            To change a user's permissions, assign them a different role.
          </p>
        </div>
      </div>

      {/* Role Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Select Role to View</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map((role) => {
            const roleConfig = ADMIN_ROLES[role];
            return (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedRole === role
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {getRoleIcon(role)}
                  <span className="font-medium">{roleConfig.name}</span>
                </div>
                <p className="text-sm text-gray-500">{roleConfig.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Permissions Grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {getRoleIcon(selectedRole)}
            <div>
              <h2 className="text-lg font-semibold">{ADMIN_ROLES[selectedRole].name}</h2>
              <p className="text-sm text-gray-500">{ADMIN_ROLES[selectedRole].description}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {selectedRole === "administrator" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                <strong>Administrator</strong> has full access to all features and permissions.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(permissionGroups).map(([group, permissions]) => (
              <div key={group} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-medium">{group}</h3>
                </div>
                <div className="p-4 space-y-2">
                  {permissions.map((permission) => (
                    <div
                      key={permission}
                      className="flex items-center justify-between py-1"
                    >
                      <span className="text-sm text-gray-600">
                        {permissionLabels[permission] || permission}
                      </span>
                      {hasPermission(permission) ? (
                        <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Current User Info */}
      {user && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            <strong>Your current role:</strong> {ADMIN_ROLES[user.role as AdminRole]?.name || user.role}
          </p>
        </div>
      )}
    </div>
  );
}
