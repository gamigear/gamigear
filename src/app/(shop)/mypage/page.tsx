"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, Package, Heart, MessageSquare, Settings, 
  ChevronRight, Gift, CreditCard, Bell, HelpCircle, LogOut, Loader2 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";
import type { LucideIcon } from "lucide-react";

interface MenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  value?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function MyPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { t } = useShopTranslation();

  const menuSections: MenuSection[] = [
    {
      title: t.mypage.shoppingInfo,
      items: [
        { name: t.mypage.orderTracking, href: "/mypage/orders", icon: Package },
        { name: t.mypage.wishlist, href: "/mypage/wishlist", icon: Heart },
        { name: t.mypage.recentlyViewed, href: "/mypage/recent", icon: Gift },
      ],
    },
    {
      title: t.mypage.benefits,
      items: [
        { name: t.mypage.coupons, href: "/mypage/coupons", icon: CreditCard, badge: "3" },
        { name: t.mypage.points, href: "/mypage/points", icon: Gift, value: "1,500P" },
      ],
    },
    {
      title: t.mypage.activities,
      items: [
        { name: t.mypage.reviews, href: "/mypage/reviews", icon: MessageSquare },
        { name: t.mypage.qna, href: "/customer", icon: HelpCircle },
      ],
    },
    {
      title: t.mypage.settings,
      items: [
        { name: t.mypage.notifications, href: "/settings/profile", icon: Bell },
        { name: t.mypage.editProfile, href: "/settings/profile", icon: Settings },
      ],
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="pb-20 pc:pb-10">
        <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4 py-8">
          <h1 className="text-2xl font-bold mb-8">{t.mypage.title}</h1>

          <div className="bg-gray-50 rounded-2xl p-8 text-center mb-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-600 mb-4">{t.mypage.loginPrompt}</p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/login"
                className="px-8 py-3 bg-black text-white font-medium rounded-lg"
              >
                {t.auth.login}
              </Link>
              <Link
                href="/register"
                className="px-8 py-3 border border-gray-300 font-medium rounded-lg"
              >
                {t.auth.register}
              </Link>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-6">
            <h2 className="font-bold mb-4">{t.mypage.guestOrderLookup}</h2>
            <p className="text-sm text-gray-500 mb-4">
              {t.orders.orderNumber}
            </p>
            <Link
              href="/customer"
              className="block w-full py-3 text-center border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
            >
              {t.mypage.guestOrderLookup}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 pc:pb-10">
      <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">{t.mypage.title}</h1>

        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-gray-500" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">{user.lastName}{user.firstName}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <LogOut size={16} />
              {t.auth.logout}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-gray-500 mt-1">{t.mypage.coupons}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{user.totalSpent ? user.totalSpent.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0}</p>
              <p className="text-xs text-gray-500 mt-1">{t.mypage.points}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{user.ordersCount || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{t.mypage.orders}</p>
            </div>
          </div>
        </div>

        {user.role === "administrator" && (
          <Link
            href="/admin"
            className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl mb-8 hover:bg-blue-100"
          >
            <div className="flex items-center gap-3">
              <Settings size={20} className="text-blue-600" />
              <span className="text-blue-700 font-medium">Admin Dashboard</span>
            </div>
            <ChevronRight size={18} className="text-blue-400" />
          </Link>
        )}

        <div className="space-y-8">
          {menuSections.map((section) => (
            <div key={section.title}>
              <h2 className="font-bold mb-3">{section.title}</h2>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} className="text-gray-400" />
                      <span>{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {item.value && (
                        <span className="text-sm font-medium">{item.value}</span>
                      )}
                      <ChevronRight size={18} className="text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
