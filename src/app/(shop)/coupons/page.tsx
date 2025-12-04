"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Ticket, Copy, Check, Clock, Tag } from "lucide-react";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";
import { formatPrice } from "@/lib/utils";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  amount: number;
  minimumAmount: number | null;
  maximumAmount: number | null;
  dateExpires: string | null;
  usageLimit: number | null;
  usageCount: number;
}

const texts = {
  en: {
    title: "Coupons",
    available: "Available Coupons",
    copy: "Copy",
    copied: "Copied!",
    expires: "Expires",
    minOrder: "Min. order",
    unlimited: "Unlimited",
    off: "off",
    noCoupons: "No coupons available",
    checkBack: "Check back later for new promotions",
    howToUse: "How to use coupons",
    step1: "Copy the coupon code",
    step2: "Add products to cart",
    step3: "Apply code at checkout",
  },
  ko: {
    title: "쿠폰",
    available: "사용 가능한 쿠폰",
    copy: "복사",
    copied: "복사됨!",
    expires: "만료일",
    minOrder: "최소 주문",
    unlimited: "무제한",
    off: "할인",
    noCoupons: "사용 가능한 쿠폰이 없습니다",
    checkBack: "새로운 프로모션을 확인해 주세요",
    howToUse: "쿠폰 사용 방법",
    step1: "쿠폰 코드 복사",
    step2: "장바구니에 상품 추가",
    step3: "결제 시 코드 적용",
  },
  vi: {
    title: "Mã giảm giá",
    available: "Mã giảm giá có sẵn",
    copy: "Sao chép",
    copied: "Đã sao chép!",
    expires: "Hết hạn",
    minOrder: "Đơn tối thiểu",
    unlimited: "Không giới hạn",
    off: "giảm",
    noCoupons: "Không có mã giảm giá",
    checkBack: "Quay lại sau để xem khuyến mãi mới",
    howToUse: "Cách sử dụng mã giảm giá",
    step1: "Sao chép mã giảm giá",
    step2: "Thêm sản phẩm vào giỏ hàng",
    step3: "Áp dụng mã khi thanh toán",
  },
};

export default function CouponsPage() {
  const { locale } = useShopTranslation();
  const t = texts[locale];
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await fetch("/api/coupons");
      const data = await response.json();
      setCoupons(data.data || []);
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === "percent") {
      return `${coupon.amount}%`;
    }
    return formatPrice(coupon.amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === "vi" ? "vi-VN" : locale === "ko" ? "ko-KR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isExpiringSoon = (dateStr: string | null) => {
    if (!dateStr) return false;
    const expires = new Date(dateStr);
    const now = new Date();
    const daysLeft = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7 && daysLeft > 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pc:pb-10">
      {/* Mobile Header */}
      <div className="pc:hidden sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center h-12 px-4">
          <Link href="/" className="p-1">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="flex-1 text-center font-bold">{t.title}</h1>
          <div className="w-8" />
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8 pc:py-12">
        <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4 text-center">
          <Ticket size={48} className="mx-auto mb-4 opacity-80" />
          <h1 className="text-2xl pc:text-3xl font-bold mb-2">{t.title}</h1>
          <p className="text-orange-100">{t.available}</p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-20">
            <Ticket size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">{t.noCoupons}</p>
            <p className="text-gray-400 text-sm mt-2">{t.checkBack}</p>
          </div>
        ) : (
          <div className="grid gap-4 pc:grid-cols-2">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex">
                  {/* Left - Discount */}
                  <div className="w-28 pc:w-36 bg-gradient-to-br from-orange-500 to-red-500 text-white p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl pc:text-3xl font-bold">{formatDiscount(coupon)}</span>
                    <span className="text-xs opacity-80">{t.off}</span>
                  </div>

                  {/* Right - Details */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{coupon.code}</h3>
                        {coupon.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{coupon.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => copyCode(coupon.code, coupon.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          copiedId === coupon.id
                            ? "bg-green-100 text-green-600"
                            : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                        }`}
                      >
                        {copiedId === coupon.id ? (
                          <>
                            <Check size={14} />
                            {t.copied}
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            {t.copy}
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                      {coupon.minimumAmount && (
                        <span className="flex items-center gap-1">
                          <Tag size={12} />
                          {t.minOrder}: {formatPrice(coupon.minimumAmount)}
                        </span>
                      )}
                      {coupon.dateExpires && (
                        <span className={`flex items-center gap-1 ${isExpiringSoon(coupon.dateExpires) ? "text-red-500" : ""}`}>
                          <Clock size={12} />
                          {t.expires}: {formatDate(coupon.dateExpires)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* How to use section */}
        <div className="mt-12 bg-white rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4">{t.howToUse}</h2>
          <div className="grid pc:grid-cols-3 gap-4">
            {[t.step1, t.step2, t.step3].map((step, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <span className="text-sm text-gray-600">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
