"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronDown, HelpCircle } from "lucide-react";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const pageTexts = {
  en: {
    title: "FAQ",
    noFaq: "No FAQs yet",
    categories: {
      all: "All",
      shipping: "Shipping",
      payment: "Payment",
      return: "Return/Exchange",
      account: "Account",
    },
  },
  ko: {
    title: "자주 묻는 질문",
    noFaq: "자주 묻는 질문이 없습니다",
    categories: {
      all: "전체",
      shipping: "배송",
      payment: "결제",
      return: "교환/반품",
      account: "회원",
    },
  },
  vi: {
    title: "Câu hỏi thường gặp",
    noFaq: "Chưa có câu hỏi",
    categories: {
      all: "Tất cả",
      shipping: "Vận chuyển",
      payment: "Thanh toán",
      return: "Đổi/Trả hàng",
      account: "Tài khoản",
    },
  },
};

const faqData: FAQ[] = [
  {
    id: "1",
    question: "배송은 얼마나 걸리나요?",
    answer: "일반 배송은 결제 완료 후 2-3일 이내에 배송됩니다. 도서산간 지역은 1-2일 추가 소요될 수 있습니다.",
    category: "shipping",
  },
  {
    id: "2",
    question: "교환/반품은 어떻게 하나요?",
    answer: "상품 수령 후 7일 이내에 고객센터로 연락 주시면 교환/반품 처리가 가능합니다. 단, 상품 훼손 시 교환/반품이 불가할 수 있습니다.",
    category: "return",
  },
  {
    id: "3",
    question: "결제 수단은 무엇이 있나요?",
    answer: "신용카드, 체크카드, 무통장입금, 카카오페이, 네이버페이, 토스페이 등 다양한 결제 수단을 지원합니다.",
    category: "payment",
  },
  {
    id: "4",
    question: "회원 탈퇴는 어떻게 하나요?",
    answer: "마이페이지 > 설정 > 회원정보 수정에서 회원 탈퇴를 진행하실 수 있습니다.",
    category: "account",
  },
];

export default function FAQPage() {
  const { locale } = useShopTranslation();
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const t = pageTexts[mounted ? locale : 'ko'];

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredFaqs = selectedCategory === "all" 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory);

  const categories = Object.entries(t.categories);

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

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {categories.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedCategory === key
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {filteredFaqs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle size={40} className="text-gray-300" />
            </div>
            <p className="text-gray-500">{t.noFaq}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-primary font-bold">Q.</span>
                    <span className="font-medium">{faq.question}</span>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 flex-shrink-0 transition-transform ${
                      openId === faq.id ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openId === faq.id && (
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 font-bold">A.</span>
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
