"use client";

import Link from "next/link";
import { ChevronLeft, Clock } from "lucide-react";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";

export default function RecentlyViewedPage() {
  const { t } = useShopTranslation();

  return (
    <div className="pb-20 pc:pb-10">
      <div className="pc:hidden sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center h-12 px-4">
          <Link href="/mypage" className="p-1">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="flex-1 text-center font-bold">{t.mypage.recentlyViewed}</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4 py-8">
        <h1 className="hidden pc:block text-2xl font-bold mb-8">{t.mypage.recentlyViewed}</h1>
        
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock size={40} className="text-gray-300" />
          </div>
          <p className="text-gray-500">{t.common.noResults}</p>
          <Link
            href="/"
            className="inline-block mt-6 px-8 py-3 bg-black text-white font-medium rounded-lg"
          >
            {t.cart.continueShopping}
          </Link>
        </div>
      </div>
    </div>
  );
}
