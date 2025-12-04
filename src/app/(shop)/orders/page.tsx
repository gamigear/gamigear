"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Package, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const { t } = useShopTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // If authenticated, redirect to mypage/orders
    if (!loading && isAuthenticated) {
      router.replace("/mypage/orders");
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Show login prompt for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-5">
        <div className="max-w-md w-full bg-gray-50 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={40} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">
            {mounted ? t.orders.title : "주문 내역"}
          </h2>
          <p className="text-gray-600 mb-6">
            {mounted ? t.mypage.loginPrompt : "로그인하고 다양한 혜택을 받아보세요"}
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/login?redirect=/mypage/orders"
              className="px-8 py-3 bg-black text-white font-medium rounded-lg"
            >
              {mounted ? t.auth.login : "로그인"}
            </Link>
            <Link
              href="/register"
              className="px-8 py-3 border border-gray-300 font-medium rounded-lg"
            >
              {mounted ? t.auth.register : "회원가입"}
            </Link>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              href="/customer"
              className="text-sm text-gray-500 hover:text-black"
            >
              {mounted ? t.mypage.guestOrderLookup : "비회원 주문조회"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  );
}
