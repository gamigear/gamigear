"use client";

import Link from "next/link";
import { ChevronLeft, Gift } from "lucide-react";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";

export default function PointsPage() {
  const { t } = useShopTranslation();

  return (
    <div className="pb-20 pc:pb-10">
      <div className="pc:hidden sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center h-12 px-4">
          <Link href="/mypage" className="p-1">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="flex-1 text-center font-bold">{t.mypage.points}</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4 py-8">
        <h1 className="hidden pc:block text-2xl font-bold mb-8">{t.mypage.points}</h1>
        
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white mb-8">
          <p className="text-sm opacity-80">{t.mypage.points}</p>
          <p className="text-3xl font-bold mt-1">0 P</p>
        </div>

        <div className="text-center py-8">
          <p className="text-gray-500">{t.common.noResults}</p>
        </div>
      </div>
    </div>
  );
}
