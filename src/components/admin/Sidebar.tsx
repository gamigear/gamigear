"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Diamond,
  Users,
  Store,
  ChevronDown,
  X,
  HelpCircle,
  Moon,
  Sun,
  ShoppingCart,
  Ticket,
  Star,
  Settings,
  Image,
  BarChart3,
  FileText,
  Shield,
  Mail,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface NavItem {
  titleKey: string;
  icon: React.ReactNode;
  url?: string;
  permission?: string; // Required permission to view this item
  children?: { titleKey: string; url: string; badge?: string; badgeColor?: string; permission?: string }[];
}

const getNavigation = (): NavItem[] => [
  { titleKey: "dashboard", icon: <Home size={20} />, url: "/admin" },
  {
    titleKey: "posts",
    icon: <FileText size={20} />,
    permission: "posts.view",
    children: [
      { titleKey: "all", url: "/admin/posts", permission: "posts.view" },
      { titleKey: "addNew", url: "/admin/posts/new", permission: "posts.create" },
      { titleKey: "categories", url: "/admin/posts/categories", permission: "categories.view" },
      { titleKey: "tags", url: "/admin/posts/tags", permission: "categories.view" },
    ],
  },
  {
    titleKey: "pages",
    icon: <FileText size={20} />,
    permission: "pages.view",
    children: [
      { titleKey: "all", url: "/admin/pages", permission: "pages.view" },
      { titleKey: "addNew", url: "/admin/pages/new", permission: "pages.create" },
      { titleKey: "homepage", url: "/admin/pages/homepage", badge: "Edit", badgeColor: "bg-blue-100 text-blue-600", permission: "pages.edit" },
      { titleKey: "menus", url: "/admin/pages/menus", badge: "New", badgeColor: "bg-green-100 text-green-600", permission: "pages.edit" },
    ],
  },
  {
    titleKey: "products",
    icon: <Diamond size={20} />,
    permission: "products.view",
    children: [
      { titleKey: "dashboard", url: "/admin/products", permission: "products.view" },
      { titleKey: "addNew", url: "/admin/products/new", permission: "products.create" },
      { titleKey: "categories", url: "/admin/products/categories", permission: "categories.view" },
      { titleKey: "bulkEdit", url: "/admin/products/bulk-edit", badge: "Bulk", badgeColor: "bg-purple-100 text-purple-600", permission: "products.edit" },
      { titleKey: "bulkSale", url: "/admin/products/bulk-sale", badge: "Sale", badgeColor: "bg-red-100 text-red-600", permission: "products.edit" },
      { titleKey: "syncWP", url: "/admin/products/sync", badge: "WP", badgeColor: "bg-blue-100 text-blue-600", permission: "products.create" },
    ],
  },
  {
    titleKey: "orders",
    icon: <ShoppingCart size={20} />,
    url: "/admin/orders",
    permission: "orders.view",
  },
  {
    titleKey: "customers",
    icon: <Users size={20} />,
    url: "/admin/customers",
    permission: "customers.view",
  },
  {
    titleKey: "coupons",
    icon: <Ticket size={20} />,
    url: "/admin/coupons",
    permission: "coupons.view",
  },
  {
    titleKey: "reviews",
    icon: <Star size={20} />,
    url: "/admin/reviews",
    permission: "reviews.view",
  },
  {
    titleKey: "banners",
    icon: <ImageIcon size={20} />,
    url: "/admin/banners",
    permission: "pages.edit",
  },
  {
    titleKey: "landingPages",
    icon: <FileText size={20} />,
    url: "/admin/landing-pages",
    permission: "pages.edit",
  },
  {
    titleKey: "media",
    icon: <Image size={20} />,
    url: "/admin/media",
    permission: "media.view",
  },
  {
    titleKey: "reports",
    icon: <BarChart3 size={20} />,
    url: "/admin/reports",
    permission: "reports.view",
  },
  {
    titleKey: "contacts",
    icon: <Mail size={20} />,
    url: "/admin/contacts",
    permission: "pages.view",
  },
  {
    titleKey: "newsletter",
    icon: <Mail size={20} />,
    url: "/admin/newsletter",
    permission: "pages.view",
  },
  {
    titleKey: "faqs",
    icon: <HelpCircle size={20} />,
    permission: "pages.view",
    children: [
      { titleKey: "allFaqs", url: "/admin/faqs", permission: "pages.view" },
      { titleKey: "faqCategories", url: "/admin/faqs/categories", permission: "pages.view" },
    ],
  },
  {
    titleKey: "users",
    icon: <Shield size={20} />,
    permission: "users.view",
    children: [
      { titleKey: "allUsers", url: "/admin/users", permission: "users.view" },
      { titleKey: "permissions", url: "/admin/users/permissions", permission: "users.view" },
    ],
  },
  { titleKey: "shop", icon: <Store size={20} />, url: "/" },
  {
    titleKey: "settings",
    icon: <Settings size={20} />,
    permission: "settings.view",
    children: [
      { titleKey: "general", url: "/admin/settings", permission: "settings.view" },
      { titleKey: "footer", url: "/admin/settings/footer", permission: "settings.edit" },
      { titleKey: "mobileMenu", url: "/admin/settings/mobile-menu", permission: "settings.edit" },
      { titleKey: "shipping", url: "/admin/shipping", permission: "settings.view" },
      { titleKey: "currencies", url: "/admin/currencies", permission: "settings.view" },
      { titleKey: "webhooks", url: "/admin/settings/webhooks", permission: "settings.edit" },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { hasPermission, user } = useAdminAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(["products"]);
  const [darkMode, setDarkMode] = useState(false);
  
  const navigation = useMemo(() => getNavigation(), []);

  // Filter navigation items based on permissions
  const filteredNavigation = useMemo(() => {
    return navigation.filter(item => {
      // No permission required
      if (!item.permission) return true;
      // Check permission
      return hasPermission(item.permission);
    }).map(item => {
      // Filter children based on permissions
      if (item.children) {
        return {
          ...item,
          children: item.children.filter(child => {
            if (!child.permission) return true;
            return hasPermission(child.permission);
          })
        };
      }
      return item;
    }).filter(item => {
      // Remove items with no children after filtering
      if (item.children && item.children.length === 0) return false;
      return true;
    });
  }, [navigation, hasPermission]);

  const getTitle = (key: string): string => {
    const navMap: Record<string, string> = {
      dashboard: t.nav.dashboard,
      products: t.nav.products,
      orders: t.nav.orders,
      customers: t.nav.customers,
      reviews: t.nav.reviews,
      coupons: t.nav.coupons,
      pages: t.nav.pages,
      posts: t.nav.posts,
      media: t.nav.media,
      settings: t.nav.settings,
      reports: t.nav.reports,
      shipping: t.nav.shipping,
      currencies: 'Tiền tệ',
      categories: t.nav.categories,
      syncWP: 'Sync WordPress',
      bulkEdit: 'Chỉnh sửa hàng loạt',
      bulkSale: 'Giảm giá hàng loạt',
      homepage: t.nav.homepage,
      menus: 'Menus',
      tags: 'Tags',
      shop: 'Shop',
      users: 'Admin Users',
      allUsers: 'All Users',
      permissions: 'Permissions',
      all: t.common.all,
      addNew: t.common.create,
      general: t.settings.general,
      footer: 'Footer',
      mobileMenu: 'Mobile Menu',
      webhooks: t.settings.webhooks,
      contacts: 'Liên hệ',
      newsletter: 'Newsletter',
      faqs: 'Hỏi đáp (FAQ)',
      allFaqs: 'Tất cả câu hỏi',
      faqCategories: 'Danh mục FAQ',
      banners: 'Banners',
      landingPages: 'Landing Pages',
    };
    return navMap[key] || key;
  };

  const toggleExpand = (titleKey: string) => {
    setExpandedItems((prev) =>
      prev.includes(titleKey) ? prev.filter((t) => t !== titleKey) : [...prev, titleKey]
    );
  };

  const isActive = (url: string) => pathname === url;
  const isParentActive = (children?: { url: string }[]) =>
    children?.some((child) => pathname === child.url);

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
            <Link href="/admin" className="text-xl font-bold">
              GAMIGEAR
            </Link>
            <button onClick={onClose} className="lg:hidden p-1">
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {filteredNavigation.map((item) => (
              <div key={item.titleKey} className="mb-1">
                {item.url ? (
                  <Link
                    href={item.url}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive(item.url)
                        ? "bg-gray-100 text-black"
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {item.icon}
                    {getTitle(item.titleKey)}
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => toggleExpand(item.titleKey)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isParentActive(item.children)
                          ? "bg-gray-100 text-black"
                          : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        {item.icon}
                        {getTitle(item.titleKey)}
                      </span>
                      <ChevronDown
                        size={16}
                        className={cn(
                          "transition-transform",
                          expandedItems.includes(item.titleKey) && "rotate-180"
                        )}
                      />
                    </button>
                    {expandedItems.includes(item.titleKey) && item.children && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.url}
                            href={child.url}
                            onClick={onClose}
                            className={cn(
                              "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                              isActive(child.url)
                                ? "text-black font-medium"
                                : "text-gray-500 hover:text-black"
                            )}
                          >
                            {getTitle(child.titleKey)}
                            {child.badge && (
                              <span
                                className={cn(
                                  "px-2 py-0.5 text-xs rounded-full",
                                  child.badgeColor || "bg-gray-200"
                                )}
                              >
                                {child.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100">
            <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
              <HelpCircle size={20} />
              Help & getting started
              <span className="ml-auto px-2 py-0.5 text-xs bg-purple-100 text-purple-600 rounded-full">
                8
              </span>
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-3 w-full px-3 py-2.5 mt-1 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
