"use client";

import Link from "next/link";
import { Phone, Mail, Clock, ChevronRight, FileText, HelpCircle, MessageSquare } from "lucide-react";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";

const menuItemsData = {
  en: [
    { name: "Notice", href: "/customer/notice", icon: FileText },
    { name: "FAQ", href: "/customer/faq", icon: HelpCircle },
    { name: "Contact Us", href: "/customer/qna", icon: MessageSquare },
  ],
  ko: [
    { name: "공지사항", href: "/customer/notice", icon: FileText },
    { name: "자주 묻는 질문", href: "/customer/faq", icon: HelpCircle },
    { name: "1:1 문의", href: "/customer/qna", icon: MessageSquare },
  ],
  vi: [
    { name: "Thông báo", href: "/customer/notice", icon: FileText },
    { name: "Câu hỏi thường gặp", href: "/customer/faq", icon: HelpCircle },
    { name: "Liên hệ", href: "/customer/qna", icon: MessageSquare },
  ],
};

const faqData = {
  en: [
    "How long does shipping take?",
    "How do I return or exchange?",
    "What payment methods are available?",
    "How do I delete my account?",
  ],
  ko: [
    "배송은 얼마나 걸리나요?",
    "교환/반품은 어떻게 하나요?",
    "결제 수단은 무엇이 있나요?",
    "회원 탈퇴는 어떻게 하나요?",
  ],
  vi: [
    "Thời gian giao hàng bao lâu?",
    "Làm sao để đổi/trả hàng?",
    "Có những phương thức thanh toán nào?",
    "Làm sao để xóa tài khoản?",
  ],
};

const pageTexts = {
  vi: {
    title: "Hỗ trợ khách hàng",
    subtitle: "Hỗ trợ khách hàng Gamigear",
    hours: "Thứ 2-6: 09:00 ~ 18:00 (Nghỉ cuối tuần và ngày lễ)",
    lunch: "Nghỉ trưa 12:00 ~ 13:00",
    faqTitle: "Câu hỏi thường gặp",
  },
  en: {
    title: "Customer Service",
    subtitle: "Gamigear Customer Service",
    hours: "Weekdays 09:00 ~ 18:00 (Closed on weekends and holidays)",
    lunch: "Lunch 12:00 ~ 13:00",
    faqTitle: "Frequently Asked Questions",
  },
  ko: {
    title: "고객센터",
    subtitle: "Gamigear 고객센터",
    hours: "평일 09:00 ~ 18:00 (주말, 공휴일 휴무)",
    lunch: "점심시간 12:00 ~ 13:00",
    faqTitle: "자주 묻는 질문",
  },
};

export default function CustomerPage() {
  const { locale } = useShopTranslation();
  const menuItems = menuItemsData[locale];
  const faqQuestions = faqData[locale];
  const t = pageTexts[locale];

  return (
    <div className="pb-20 pc:pb-10">
      <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">{t.title}</h1>

        {/* Contact Info */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <div className="flex flex-col pc:flex-row pc:items-center pc:justify-between gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">{t.subtitle}</p>
              <a href="tel:1544-6040" className="text-3xl font-bold flex items-center gap-2">
                <Phone size={28} />
                1544-6040
              </a>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                <span>{t.hours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-400" />
                <span>{t.lunch}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gray-400" />
                <span>[email]</span>
              </div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} className="text-gray-400" />
                <span className="font-medium">{item.name}</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </Link>
          ))}
        </div>

        {/* FAQ Preview */}
        <div className="mt-10">
          <h2 className="text-lg font-bold mb-4">{t.faqTitle}</h2>
          <div className="space-y-2">
            {faqQuestions.map((question, i) => (
              <Link
                key={i}
                href="/customer/faq"
                className="block p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                <span className="text-primary font-medium mr-2">Q.</span>
                {question}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
