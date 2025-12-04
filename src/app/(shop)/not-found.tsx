"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";

const pageTexts = {
  en: {
    title: "Page Not Found",
    subtitle: "The page you're looking for doesn't exist or has been moved.",
    goHome: "Go to Home",
    goBack: "Go Back",
    searchProducts: "Search Products",
  },
  ko: {
    title: "페이지를 찾을 수 없습니다",
    subtitle: "요청하신 페이지가 존재하지 않거나 이동되었습니다.",
    goHome: "홈으로 가기",
    goBack: "뒤로 가기",
    searchProducts: "상품 검색",
  },
  vi: {
    title: "Không tìm thấy trang",
    subtitle: "Trang bạn đang tìm không tồn tại hoặc đã được di chuyển.",
    goHome: "Về trang chủ",
    goBack: "Quay lại",
    searchProducts: "Tìm sản phẩm",
  },
};

export default function NotFound() {
  const { locale } = useShopTranslation();
  const [mounted, setMounted] = useState(false);
  const t = pageTexts[mounted ? locale : 'ko'];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl font-bold text-gray-200 mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">{t.title}</h1>
        <p className="text-gray-500 mb-8">{t.subtitle}</p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800"
          >
            <Home size={18} />
            {t.goHome}
          </Link>
          <button
            onClick={handleGoBack}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 font-medium rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft size={18} />
            {t.goBack}
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-400 mb-4">
            {mounted ? "Looking for something?" : "무엇을 찾고 계신가요?"}
          </p>
          <div className="flex gap-4 justify-center text-sm">
            <Link href="/category/best" className="text-gray-600 hover:text-black">
              Best
            </Link>
            <Link href="/category/new" className="text-gray-600 hover:text-black">
              New
            </Link>
            <Link href="/blog" className="text-gray-600 hover:text-black">
              Blog
            </Link>
            <Link href="/customer" className="text-gray-600 hover:text-black">
              Help
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
