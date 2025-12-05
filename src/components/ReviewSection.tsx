"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  review: string;
  createdAt: string;
  product?: {
    name: string;
    images: { src: string }[];
  };
}

const reviewTexts = {
  en: { title: "Latest Reviews", more: "See More" },
  ko: { title: "실시간 리뷰", more: "더보기" },
  vi: { title: "Đánh giá mới nhất", more: "Xem thêm" },
};

export default function ReviewSection() {
  const { locale } = useShopTranslation();
  const [mounted, setMounted] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const texts = reviewTexts[mounted ? locale : 'vi'];

  useEffect(() => {
    setMounted(true);
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews?limit=10&status=approved');
      const data = await response.json();
      if (data.reviews) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!mounted) return ""; // Avoid hydration mismatch
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-4 pc:py-12 bg-gray-50">
      <div className="mx-auto w-full max-w-[1280px] px-3 pc:px-4">
        <div className="flex items-center justify-between mb-4 pc:mb-6">
          <h2 className="text-lg pc:text-2xl font-bold">{texts.title}</h2>
          <Link href="/reviews" className="text-xs pc:text-sm text-gray-500 hover:text-black">
            {texts.more}
          </Link>
        </div>

        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={12}
          slidesPerView={1.2}
          navigation
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 16 },
            1024: { slidesPerView: 3, spaceBetween: 16 },
          }}
          className="review-slider"
        >
          {reviews.map((review) => (
            <SwiperSlide key={review.id}>
              <div className="bg-white rounded-xl p-3 pc:p-4 border border-gray-100 h-full">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={
                        i < review.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-200"
                      }
                    />
                  ))}
                </div>
                <p className="text-xs pc:text-sm text-gray-700 line-clamp-3 mb-2 pc:mb-3 min-h-[48px] pc:min-h-[60px]">
                  {review.review}
                </p>
                {review.product && (
                  <p className="text-[10px] pc:text-xs text-gray-500 line-clamp-1 mb-2">
                    {review.product.name}
                  </p>
                )}
                <div className="flex items-center justify-between text-[10px] pc:text-xs text-gray-400">
                  <span>{review.reviewerName}</span>
                  <span>{formatDate(review.createdAt)}</span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .review-slider .swiper-button-next,
        .review-slider .swiper-button-prev {
          width: 32px;
          height: 32px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .review-slider .swiper-button-next:after,
        .review-slider .swiper-button-prev:after {
          font-size: 14px;
          color: #333;
          font-weight: bold;
        }
        @media (max-width: 768px) {
          .review-slider .swiper-button-next,
          .review-slider .swiper-button-prev {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
