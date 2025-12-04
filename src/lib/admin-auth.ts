// Admin roles and their permissions - Client-safe (no server imports)

export const ADMIN_ROLES = {
  administrator: {
    name: "Administrator",
    description: "Full access to all features",
    permissions: ["*"], // All permissions
  },
  shop_manager: {
    name: "Shop Manager",
    description: "Manage products, orders, and customers",
    permissions: [
      "products.view", "products.create", "products.edit", "products.delete",
      "orders.view", "orders.edit", "orders.delete",
      "customers.view", "customers.edit",
      "coupons.view", "coupons.create", "coupons.edit", "coupons.delete",
      "reviews.view", "reviews.edit", "reviews.delete",
      "media.view", "media.upload", "media.delete",
      "reports.view",
    ],
  },
  editor: {
    name: "Editor",
    description: "Manage posts and pages",
    permissions: [
      "posts.view", "posts.create", "posts.edit", "posts.delete",
      "pages.view", "pages.create", "pages.edit", "pages.delete",
      "media.view", "media.upload",
      "categories.view", "categories.create", "categories.edit",
    ],
  },
  customer: {
    name: "Customer",
    description: "Regular customer account",
    permissions: [],
  },
} as const;

export type AdminRole = keyof typeof ADMIN_ROLES;

// Check if user has a specific permission
export function hasPermission(role: string, permission: string): boolean {
  const roleConfig = ADMIN_ROLES[role as AdminRole];
  if (!roleConfig) return false;
  
  // Administrator has all permissions
  if (roleConfig.permissions.includes("*")) return true;
  
  // Check specific permission
  return roleConfig.permissions.includes(permission);
}

// Check if user has any of the specified permissions
export function hasAnyPermission(role: string, permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

// Check if user has all of the specified permissions
export function hasAllPermissions(role: string, permissions: string[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

// Check if user is an admin (has any admin role)
export function isAdminRole(role: string): boolean {
  return ["administrator", "shop_manager", "editor"].includes(role);
}

// Get all permissions for a role
export function getRolePermissions(role: string): string[] {
  const roleConfig = ADMIN_ROLES[role as AdminRole];
  if (!roleConfig) return [];
  
  if (roleConfig.permissions.includes("*")) {
    // Return all possible permissions for administrator
    return [
      "products.view", "products.create", "products.edit", "products.delete",
      "orders.view", "orders.edit", "orders.delete",
      "customers.view", "customers.edit", "customers.delete",
      "coupons.view", "coupons.create", "coupons.edit", "coupons.delete",
      "reviews.view", "reviews.edit", "reviews.delete",
      "media.view", "media.upload", "media.delete",
      "reports.view", "reports.export",
      "posts.view", "posts.create", "posts.edit", "posts.delete",
      "pages.view", "pages.create", "pages.edit", "pages.delete",
      "categories.view", "categories.create", "categories.edit", "categories.delete",
      "settings.view", "settings.edit",
      "users.view", "users.create", "users.edit", "users.delete",
    ];
  }
  
  return [...roleConfig.permissions];
}
