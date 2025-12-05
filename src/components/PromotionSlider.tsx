"use client";

import { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";
import { Ticket, Copy, Check } from "lucide-react";

import "swiper/css";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  amount: number;
  minimumAmount: number | null;
  dateExpires: string | null;
}

const promotionTexts = {
  en: {
    label: "Special Offers",
    title: "COUPON",
    subtitle: "Use coupons to save on your purchase",
    discount: "Discount",
    minOrder: "Min order",
    expires: "Expires",
    noExpiry: "No expiry",
    copy: "Copy code",
    copied: "Copied!",
  },
  ko: {
    label: "특별 혜택",
    title: "COUPON",
    subtitle: "쿠폰을 사용하여 할인 받으세요",
    discount: "할인",
    minOrder: "최소 주문",
    expires: "만료일",
    noExpiry: "무기한",
    copy: "코드 복사",
    copied: "복사됨!",
  },
  vi: {
    label: "Ưu đãi đặc biệt",
    title: "COUPON",
    subtitle: "Sử dụng mã giảm giá để tiết kiệm hơn",
    discount: "Giảm",
    minOrder: "Đơn tối thiểu",
    expires: "Hết hạn",
    noExpiry: "Không giới hạn",
    copy: "Sao chép mã",
    copied: "Đã sao chép!",
  },
};

export default function PromotionSlider() {
  const { locale } = useShopTranslation();
  const [mounted, setMounted] = useState(false);
  const texts = promotionTexts[mounted ? locale : "ko"];
  const swiperRef = useRef<SwiperType | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await fetch("/api/coupons?active=true");
      const data = await response.json();
      setCoupons(data.data || []);
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return texts.noExpiry;
    if (!mounted) return ""; // Avoid hydration mismatch
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === "percent") {
      return `-${coupon.amount}%`;
    }
    // Use simple formatting to avoid hydration mismatch
    return `-${coupon.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}đ`;
  };

  const formatMinAmount = (amount: number | null) => {
    if (!amount) return null;
    // Use simple formatting to avoid hydration mismatch
    return `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}đ`;
  };

  const handleCopy = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // Don't render if no coupons
  if (!loading && coupons.length === 0) {
    return null;
  }

  return (
    <section className="corner-main-promotion relative w-full pc:mb-[120px] mo:mb-[80px]">
      <div className="relative z-10 mx-auto max-w-[1280px] px-5 pc:px-4">
        <div className="flex flex-wrap justify-between pt-12 pc:pt-20 pb-12 pc:pb-16">
          {/* Left Content */}
          <div className="z-10 w-full pc:w-[260px] shrink-0 mo:mb-6">
            <p className="text-base mo:text-sm mb-7 mo:mb-2.5 font-normal text-white">
              {texts.label}
            </p>
            <p className="text-2xl pc:text-[28px] mo:text-xl mb-5 mo:mb-4 font-bold text-white leading-tight whitespace-pre-line">
              {texts.title}
            </p>
            <p className="text-sm mo:text-xs font-normal text-white">
              {texts.subtitle}
            </p>

            {/* Navigation Buttons - Desktop */}
            <div className="mt-10 hidden pc:flex gap-2.5">
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                className="swiper-btn-prev w-[48px] h-[48px] rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-white"
                >
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                onClick={() => swiperRef.current?.slideNext()}
                className="swiper-btn-next w-[48px] h-[48px] rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-white"
                >
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Slider */}
          <div className="w-full pc:w-[896px] pc:pt-[50px]">
            <Swiper
              modules={[Navigation]}
              loop={coupons.length > 3}
              slidesPerView={1.2}
              spaceBetween={16}
              breakpoints={{
                768: {
                  slidesPerView: 3,
                  spaceBetween: 24,
                },
              }}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              onSlideChange={(swiper) => {
                setCurrentIndex(swiper.realIndex);
              }}
              className="w-full"
            >
              {coupons.map((coupon) => (
                <SwiperSlide key={coupon.id}>
                  <div className="relative bg-white rounded-xl overflow-hidden shadow-lg">
                    {/* Coupon Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <Ticket size={20} />
                        <span className="text-sm font-medium">COUPON</span>
                      </div>
                      <div className="text-3xl font-bold">
                        {formatDiscount(coupon)}
                      </div>
                    </div>

                    {/* Coupon Body */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 min-h-[48px]">
                        {coupon.description || coupon.code}
                      </h3>

                      <div className="space-y-1 text-sm text-gray-500 mb-4">
                        {coupon.minimumAmount && (
                          <p>
                            {texts.minOrder}: {formatMinAmount(coupon.minimumAmount)}
                          </p>
                        )}
                        <p>
                          {texts.expires}: {formatDate(coupon.dateExpires)}
                        </p>
                      </div>

                      {/* Coupon Code */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2 font-mono text-sm font-bold text-center border-2 border-dashed border-gray-300">
                          {coupon.code}
                        </div>
                        <button
                          onClick={() => handleCopy(coupon.code, coupon.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            copiedId === coupon.id
                              ? "bg-green-100 text-green-600"
                              : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                          }`}
                          title={copiedId === coupon.id ? texts.copied : texts.copy}
                        >
                          {copiedId === coupon.id ? (
                            <Check size={20} />
                          ) : (
                            <Copy size={20} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Decorative circles */}
                    <div className="absolute left-0 top-1/2 -translate-x-1/2 w-6 h-6 bg-[#1a1a2e] rounded-full" />
                    <div className="absolute right-0 top-1/2 translate-x-1/2 w-6 h-6 bg-[#1a1a2e] rounded-full" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Mobile Pagination */}
            <div className="pc:hidden flex justify-center mt-6">
              <div className="px-4 py-1.5 bg-white/20 rounded-full text-white text-sm">
                <span>{currentIndex + 1}</span>
                <span className="mx-1.5 text-white/60">/</span>
                <span className="text-white/60">{coupons.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
