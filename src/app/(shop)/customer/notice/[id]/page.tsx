"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Calendar } from "lucide-react";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";

const pageTexts = {
  en: {
    title: "Notice",
    backToList: "Back to list",
    notFound: "Notice not found",
  },
  ko: {
    title: "공지사항",
    backToList: "목록으로",
    notFound: "공지사항을 찾을 수 없습니다",
  },
  vi: {
    title: "Thông báo",
    backToList: "Quay lại danh sách",
    notFound: "Không tìm thấy thông báo",
  },
};

// Sample notice data
const noticesData: Record<string, { title: string; date: string; content: string }> = {
  "1": {
    title: "2024년 설 연휴 배송 안내",
    date: "2024-01-25",
    content: `안녕하세요, Gamigear입니다.

2024년 설 연휴 기간 배송 일정을 안내드립니다.

■ 연휴 기간: 2024년 2월 9일(금) ~ 2월 12일(월)

■ 배송 안내
- 2월 7일(수) 오후 2시 이전 결제 완료 건: 연휴 전 출고
- 2월 7일(수) 오후 2시 이후 결제 건: 2월 13일(화)부터 순차 출고

■ 고객센터 운영
- 연휴 기간 중 고객센터 휴무
- 2월 13일(화)부터 정상 운영

즐거운 설 연휴 보내세요!
감사합니다.`,
  },
  "2": {
    title: "개인정보처리방침 개정 안내",
    date: "2024-01-15",
    content: `안녕하세요, Gamigear입니다.

개인정보처리방침이 아래와 같이 개정됨을 안내드립니다.

■ 시행일: 2024년 2월 1일

■ 주요 변경 사항
1. 개인정보 수집 항목 변경
2. 개인정보 보유 기간 명확화
3. 제3자 제공 내용 업데이트

자세한 내용은 개인정보처리방침 페이지에서 확인하실 수 있습니다.

감사합니다.`,
  },
  "3": {
    title: "신규 회원 가입 이벤트 안내",
    date: "2024-01-10",
    content: `안녕하세요, Gamigear입니다.

신규 회원을 위한 특별 이벤트를 진행합니다!

■ 이벤트 기간: 2024년 1월 10일 ~ 2월 28일

■ 혜택 내용
1. 회원가입 즉시 3,000원 할인 쿠폰 지급
2. 첫 구매 시 무료 배송
3. 리뷰 작성 시 500포인트 적립

많은 참여 부탁드립니다!
감사합니다.`,
  },
  "4": {
    title: "시스템 점검 안내 (1/5)",
    date: "2024-01-03",
    content: `안녕하세요, Gamigear입니다.

서비스 품질 향상을 위한 시스템 점검을 진행합니다.

■ 점검 일시: 2024년 1월 5일(금) 02:00 ~ 06:00 (4시간)

■ 점검 내용
- 서버 안정화 작업
- 결제 시스템 업그레이드

점검 시간 동안 서비스 이용이 제한될 수 있습니다.
이용에 불편을 드려 죄송합니다.

감사합니다.`,
  },
};

export default function NoticeDetailPage() {
  const params = useParams();
  const { locale } = useShopTranslation();
  const [mounted, setMounted] = useState(false);
  const t = pageTexts[mounted ? locale : 'ko'];
  
  const noticeId = params.id as string;
  const notice = noticesData[noticeId];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!notice) {
    return (
      <div className="pb-20 pc:pb-10">
        <div className="pc:hidden sticky top-0 z-50 bg-white border-b border-gray-100">
          <div className="flex items-center h-12 px-4">
            <Link href="/customer/notice" className="p-1">
              <ChevronLeft size={24} />
            </Link>
            <h1 className="flex-1 text-center font-bold">{t.title}</h1>
            <div className="w-8" />
          </div>
        </div>
        <div className="text-center py-16">
          <p className="text-gray-500">{t.notFound}</p>
          <Link
            href="/customer/notice"
            className="inline-block mt-4 text-primary hover:underline"
          >
            {t.backToList}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 pc:pb-10">
      <div className="pc:hidden sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center h-12 px-4">
          <Link href="/customer/notice" className="p-1">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="flex-1 text-center font-bold">{t.title}</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-[800px] px-5 pc:px-4 py-8">
        <div className="border-b border-gray-200 pb-6 mb-6">
          <h1 className="text-xl pc:text-2xl font-bold mb-3">{notice.title}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={16} />
            <span>{notice.date}</span>
          </div>
        </div>

        <div className="prose max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
            {notice.content}
          </pre>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200">
          <Link
            href="/customer/notice"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black"
          >
            <ChevronLeft size={18} />
            {t.backToList}
          </Link>
        </div>
      </div>
    </div>
  );
}
