"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, MessageSquare, Send, Loader2 } from "lucide-react";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";
import { useAuth } from "@/contexts/AuthContext";

const pageTexts = {
  en: {
    title: "Contact Us",
    subtitle: "We'll respond within 24 hours",
    name: "Name",
    email: "Email",
    phone: "Phone",
    subject: "Subject",
    message: "Message",
    submit: "Submit",
    submitting: "Submitting...",
    success: "Your inquiry has been submitted. We'll respond soon.",
    loginPrompt: "Please login to submit an inquiry",
    placeholders: {
      name: "Enter your name",
      email: "Enter your email",
      phone: "Enter your phone number",
      subject: "Enter subject",
      message: "Enter your message",
    },
  },
  ko: {
    title: "1:1 문의",
    subtitle: "24시간 이내에 답변드리겠습니다",
    name: "이름",
    email: "이메일",
    phone: "연락처",
    subject: "제목",
    message: "문의 내용",
    submit: "문의하기",
    submitting: "전송 중...",
    success: "문의가 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.",
    loginPrompt: "문의하시려면 로그인해주세요",
    placeholders: {
      name: "이름을 입력하세요",
      email: "이메일을 입력하세요",
      phone: "연락처를 입력하세요",
      subject: "제목을 입력하세요",
      message: "문의 내용을 입력하세요",
    },
  },
  vi: {
    title: "Liên hệ",
    subtitle: "Chúng tôi sẽ phản hồi trong vòng 24 giờ",
    name: "Họ tên",
    email: "Email",
    phone: "Số điện thoại",
    subject: "Tiêu đề",
    message: "Nội dung",
    submit: "Gửi",
    submitting: "Đang gửi...",
    success: "Yêu cầu của bạn đã được gửi. Chúng tôi sẽ phản hồi sớm.",
    loginPrompt: "Vui lòng đăng nhập để gửi yêu cầu",
    placeholders: {
      name: "Nhập họ tên",
      email: "Nhập email",
      phone: "Nhập số điện thoại",
      subject: "Nhập tiêu đề",
      message: "Nhập nội dung",
    },
  },
};

export default function QnAPage() {
  const { locale } = useShopTranslation();
  const { user, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const t = pageTexts[mounted ? locale : 'ko'];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: `${user.lastName || ''}${user.firstName || ''}`.trim(),
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSuccess(true);
    setLoading(false);
  };

  if (success) {
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

        <div className="mx-auto w-full max-w-[600px] px-5 pc:px-4 py-16 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare size={40} className="text-green-500" />
          </div>
          <p className="text-gray-600 mb-8">{t.success}</p>
          <Link
            href="/customer"
            className="inline-block px-8 py-3 bg-black text-white font-medium rounded-lg"
          >
            {t.title}
          </Link>
        </div>
      </div>
    );
  }

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

      <div className="mx-auto w-full max-w-[600px] px-5 pc:px-4 py-8">
        <h1 className="hidden pc:block text-2xl font-bold mb-2">{t.title}</h1>
        <p className="hidden pc:block text-gray-500 mb-8">{t.subtitle}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t.name} *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t.placeholders.name}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t.phone}</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={t.placeholders.phone}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.email} *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={t.placeholders.email}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.subject} *</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder={t.placeholders.subject}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.message} *</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder={t.placeholders.message}
              rows={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.submitting}
              </>
            ) : (
              <>
                <Send size={18} />
                {t.submit}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
