"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/Header";
import { I18nProvider } from "@/lib/i18n";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Don't show sidebar/header on login page
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <AdminAuthProvider>{children}</AdminAuthProvider>;
  }

  return (
    <AdminAuthProvider>
      <I18nProvider>
        <div className="min-h-screen bg-gray-50">
          <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="lg:pl-64">
            <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
            <main className="p-4 lg:p-6">{children}</main>
          </div>
        </div>
      </I18nProvider>
    </AdminAuthProvider>
  );
}
