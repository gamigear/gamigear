"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";

interface FooterSettings {
  companyName: { ko: string; en: string; vi: string };
  ceo: { ko: string; en: string; vi: string };
  address: { ko: string; en: string; vi: string };
  businessNo: string;
  salesNo: string;
  phone: string;
  fax: string;
  email: string;
  hours: { ko: string; en: string; vi: string };
  lunchTime: { ko: string; en: string; vi: string };
  disclaimer: { ko: string; en: string; vi: string };
  copyright: { ko: string; en: string; vi: string };
  socialLinks: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    kakao?: string;
    naver?: string;
  };
}

const staticTexts = {
  en: {
    notice: "Notice",
    noticeDesc: "Check out the latest news",
    noticeLink: "Go to Notice",
    customerService: "Gamigear Customer Service",
    csLink: "Go to Customer Service",
    businessNoLabel: "Business Registration No",
    salesNoLabel: "Mail Order Sales No",
    faxLabel: "Fax",
    emailLabel: "Email",
    about: "About Us",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
  },
  ko: {
    notice: "공지사항",
    noticeDesc: "새로운 소식을 확인하세요",
    noticeLink: "공지사항 바로가기",
    customerService: "Gamigear 고객센터",
    csLink: "고객센터 바로가기",
    businessNoLabel: "사업자등록번호",
    salesNoLabel: "통신판매업신고번호",
    faxLabel: "팩스",
    emailLabel: "이메일",
    about: "회사소개",
    terms: "이용약관",
    privacy: "개인정보처리방침",
  },
  vi: {
    notice: "Thông báo",
    noticeDesc: "Xem tin tức mới nhất",
    noticeLink: "Xem thông báo",
    customerService: "Hỗ trợ khách hàng Gamigear",
    csLink: "Liên hệ hỗ trợ",
    businessNoLabel: "Mã số doanh nghiệp",
    salesNoLabel: "Giấy phép kinh doanh",
    faxLabel: "Fax",
    emailLabel: "Email",
    about: "Về chúng tôi",
    terms: "Điều khoản sử dụng",
    privacy: "Chính sách bảo mật",
  },
};

const defaultSettings: FooterSettings = {
  companyName: {
    ko: "(주)아이스크림미디어",
    en: "i-Scream Media Co., Ltd.",
    vi: "Công ty TNHH i-Scream Media",
  },
  ceo: { ko: "대표이사 : 홍길동", en: "CEO: Hong Gil Dong", vi: "Giám đốc: Hong Gil Dong" },
  address: {
    ko: "주소 : 경기도 성남시 분당구 판교역로 225-20",
    en: "Address: 225-20 Pangyoyeok-ro, Bundang-gu, Seongnam-si",
    vi: "Địa chỉ: 225-20 Pangyoyeok-ro, Bundang-gu, Seongnam-si",
  },
  businessNo: "123-45-67890",
  salesNo: "2024-경기성남-12345",
  phone: "1544-6040",
  fax: "02-3444-0308",
  email: "support@gamigear.com",
  hours: {
    ko: "평일 09:00 ~ 18:00 (주말, 공휴일 휴무)",
    en: "Weekdays 09:00 ~ 18:00 (Closed on weekends)",
    vi: "Thứ 2-6: 09:00 ~ 18:00 (Nghỉ cuối tuần)",
  },
  lunchTime: { ko: "점심시간 12:00 ~ 13:00", en: "Lunch 12:00 ~ 13:00", vi: "Nghỉ trưa 12:00 ~ 13:00" },
  disclaimer: {
    ko: "Gamigear에서 판매되는 상품중에는 위탁판매자가 판매하는 상품이 포함되어 있습니다.",
    en: "Some products sold on Gamigear are sold by consignment sellers.",
    vi: "Một số sản phẩm trên Gamigear được bán bởi người bán ký gửi.",
  },
  copyright: {
    ko: "Copyright © (주)아이스크림미디어. All Rights Reserved",
    en: "Copyright © i-Scream Media Co., Ltd. All Rights Reserved",
    vi: "Copyright © i-Scream Media Co., Ltd. All Rights Reserved",
  },
  socialLinks: {},
};

export default function Footer() {
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<FooterSettings>(defaultSettings);
  const { locale } = useShopTranslation();

  useEffect(() => {
    setMounted(true);
    fetch("/api/settings/footer")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(() => {});
  }, []);

  const lang = mounted ? locale : "ko";
  const t = staticTexts[lang];
  const s = settings;

  return (
    <footer className="w-full">
      {/* Notice Section - Desktop */}
      <div className="hidden pc:block border-b border-gray-200">
        <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4">
          <div className="flex items-center py-5">
            <Link href="/customer/notice" className="flex items-center gap-6 flex-1">
              <strong className="text-base font-bold">{t.notice}</strong>
              <p className="text-sm text-gray-500 truncate">{t.noticeDesc}</p>
            </Link>
            <Link href="/customer/notice" className="text-gray-400 hover:text-black">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Notice Section - Mobile */}
      <div className="pc:hidden px-5 py-8 border-b border-gray-200">
        <strong className="text-lg font-bold">{t.notice}</strong>
        <div className="mt-7">
          <Link href="/customer/notice" className="block w-full py-3 text-center text-sm border border-gray-200 rounded-lg">
            {t.noticeLink}
          </Link>
        </div>
      </div>

      {/* Customer Service - Mobile */}
      <div className="pc:hidden px-5 py-8">
        <div className="text-right">
          <Link href="/customer" className="text-sm font-medium">{t.customerService} →</Link>
          <strong className="block text-2xl font-bold mt-1">{s.phone}</strong>
          <p className="text-xs text-gray-500 mt-1">{s.hours[lang]}</p>
          <p className="text-xs text-gray-400">{s.lunchTime[lang]}</p>
          <div className="mt-7">
            <Link href="/customer" className="block w-full py-3 text-center text-sm border border-gray-200 rounded-lg">
              {t.csLink}
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4">
        <div className="flex justify-between pt-12 pc:pb-10 mo:flex-col mo:border-t mo:border-gray-200 mo:pt-8">
          {/* Left Section */}
          <div className="mo:flex mo:flex-col">
            {/* Logo */}
            <div className="mb-6 mo:mb-8">
              <span className="text-xl font-bold text-gray-400">Gamigear</span>
            </div>

            {/* Links */}
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-4 mo:order-3 mo:mt-8">
              <li><Link href="/about" className="hover:text-black">{t.about}</Link></li>
              <li><Link href="/terms" className="hover:text-black">{t.terms}</Link></li>
              <li><Link href="/privacy" className="hover:text-black font-bold">{t.privacy}</Link></li>
            </ul>

            {/* Company Info */}
            <div className="text-sm text-gray-500 space-y-1 mo:order-1">
              <p><span className="font-medium text-gray-700">{s.companyName[lang]}</span></p>
              <p>{s.ceo[lang]}</p>
              <p>{s.address[lang]}</p>
              <p>{t.businessNoLabel}: {s.businessNo}</p>
              <p>{t.salesNoLabel}: {s.salesNo}</p>
            </div>

            {/* Contact - Mobile */}
            <div className="mo:order-4 mo:mt-7 mo:pt-7 mo:border-t mo:border-gray-200 pc:hidden">
              <p className="text-sm text-gray-500">{t.customerService}: <a href={`tel:${s.phone}`}>{s.phone}</a></p>
              <p className="text-sm text-gray-500">{t.faxLabel}: {s.fax}</p>
              <p className="text-sm text-gray-500">{t.emailLabel}: {s.email}</p>
            </div>

            {/* Social Links */}
            {Object.values(s.socialLinks).some(Boolean) && (
              <div className="flex gap-3 mt-4 mo:order-2">
                {s.socialLinks.facebook && (
                  <a href={s.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                )}
                {s.socialLinks.instagram && (
                  <a href={s.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                )}
                {s.socialLinks.youtube && (
                  <a href={s.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                )}
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-gray-400 mt-6 mo:order-6 mo:mt-7 leading-relaxed max-w-[600px]">
              {s.disclaimer[lang]}
            </p>

            {/* Copyright */}
            <p className="text-xs text-gray-400 mt-4 mo:order-5 mo:mt-8">
              {s.copyright[lang]}
            </p>
          </div>

          {/* Right Section - Customer Service (Desktop) */}
          <div className="hidden pc:block text-right mt-16">
            <Link href="/customer" className="text-sm font-medium">{t.customerService} →</Link>
            <strong className="block text-2xl font-bold mt-1">{s.phone}</strong>
            <p className="text-xs text-gray-500 mt-1">{s.hours[lang]}</p>
            <p className="text-xs text-gray-400">{s.lunchTime[lang]}</p>
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar Spacer */}
      <div className="h-16 pc:hidden" />
    </footer>
  );
}
