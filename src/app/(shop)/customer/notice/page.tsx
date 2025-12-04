"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Bell } from "lucide-react";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";

interface Notice {
  id: string;
  title: string;
  date: string;
  important: boolean;
}

const pageTexts = {
  en: {
    title: "Notice",
    noNotices: "No notices yet",
    important: "Important",
  },
  ko: {
    title: "공지사항",
    noNotices: "공지사항이 없습니다",
    important: "중요",
  },
  vi: {
    title: "Thông báo",
    noNotices: "Chưa có thông báo",
    important: "Quan trọng",
  },
};

// Sample notices data
const sampleNotices: Notice[] = [
  { id: "1", title: "2024년 설 연휴 배송 안내", date: "2024-01-25", important: true },
  { id: "2", title: "개인정보처리방침 개정 안내", date: "2024-01-15", important: false },
  { id: "3", title: "신규 회원 가입 이벤트 안내", date: "2024-01-10", important: false },
  { id: "4", title: "시스템 점검 안내 (1/5)", date: "2024-01-03", important: false },
];

export default function NoticePage() {
  const { locale } = useShopTranslation();
  const [mounted, setMounted] = useState(false);
  const t = pageTexts[mounted ? locale : 'ko'];

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="pb-20 pc:pb-10">
      <div className="pc:hidden sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center h-12 px-4">
          <Link href="/customer" className="p-1">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="flex-1 text-center font-bold">{t.title}</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4 py-8">
        <h1 className="hidden pc:block text-2xl font-bold mb-8">{t.title}</h1>

        {sampleNotices.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={40} className="text-gray-300" />
            </div>
            <p className="text-gray-500">{t.noNotices}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sampleNotices.map((notice) => (
              <Link
                key={notice.id}
                href={`/customer/notice/${notice.id}`}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {notice.important && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded">
                        {t.important}
                      </span>
                    )}
                    <span className="font-medium line-clamp-1">{notice.title}</span>
                  </div>
                  <span className="text-sm text-gray-400">{notice.date}</span>
                </div>
                <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
