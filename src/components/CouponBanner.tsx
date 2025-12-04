"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";

interface CouponBannerSettings {
  title: string;
  subtitle: string;
  buttonText: string;
  link: string;
  enabled: boolean;
}

const defaultTexts = {
  en: { title: "$3 off your first purchase", subtitle: "New member benefit", buttonText: "Get Coupon" },
  ko: { title: "첫 구매 시 3,000원 할인", subtitle: "신규 회원 혜택", buttonText: "쿠폰받기" },
  vi: { title: "Giảm 30.000đ cho đơn đầu tiên", subtitle: "Ưu đãi thành viên mới", buttonText: "Nhận mã" },
};

export default function CouponBanner() {
  const { locale } = useShopTranslation();
  const [mounted, setMounted] = useState(false);
  const texts = defaultTexts[mounted ? locale : 'ko'];
  
  const [settings, setSettings] = useState<CouponBannerSettings>({
    title: texts.title,
    subtitle: texts.subtitle,
    buttonText: texts.buttonText,
    link: "/coupons",
    enabled: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/homepage');
      const data = await response.json();
      
      if (data.settings) {
        setSettings({
          title: data.settings.couponBannerTitle || settings.title,
          subtitle: data.settings.couponBannerSubtitle || settings.subtitle,
          buttonText: data.settings.couponBannerButtonText || settings.buttonText,
          link: data.settings.couponBannerLink || settings.link,
          enabled: data.settings.couponBannerEnabled !== false,
        });
      }
    } catch (error) {
      console.error('Failed to fetch coupon banner settings:', error);
    }
  };

  if (!settings.enabled) {
    return null;
  }

  return (
    <section className="py-2 pc:py-12">
      <div className="mx-auto w-full max-w-[1280px] px-3 pc:px-4">
        <div className="relative h-[50px] pc:h-[160px] bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg pc:rounded-2xl overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-between px-3 pc:px-12">
            <div className="text-white">
              <p className="text-[10px] pc:text-sm opacity-80 leading-tight">{settings.subtitle}</p>
              <h3 className="text-xs pc:text-2xl font-bold mt-0 pc:mt-1 leading-tight">
                {settings.title}
              </h3>
            </div>
            <Link
              href={settings.link}
              className="px-3 pc:px-6 py-1 pc:py-2 bg-white text-orange-600 font-medium rounded-full text-[10px] pc:text-sm hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              {settings.buttonText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
