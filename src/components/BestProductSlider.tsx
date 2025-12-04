"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Grid } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronRight } from "lucide-react";
import type { ProductData } from "@/lib/api";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";
import { homepageTranslations } from "@/lib/i18n/shop-translations";
import Price from "@/components/Price";

import "swiper/css";
import "swiper/css/grid";

interface BestProductSliderProps {
  products: ProductData[];
  title?: string;
}

export default function BestProductSlider({ products, title }: BestProductSliderProps) {
  const { locale } = useShopTranslation();
  const [mounted, setMounted] = useState(false);
  const t = homepageTranslations[mounted ? locale : 'ko'];
  const swiperRef = useRef<SwiperType | null>(null);
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="pc:mb-[120px] mo:mb-[80px] pc:overflow-hidden">
      <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-2.5 pc:mb-9">
          <h2 className="text-xl pc:text-2xl font-bold">{title || t.sections.bestSellers}</h2>
          <Link
            href="/category/best"
            className="flex items-center text-sm text-gray-400 hover:text-gray-600"
          >
            {t.sections.viewAll}
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* Slider */}
        <div className="swiper-product relative">
          <Swiper
            modules={[Navigation, Grid]}
            loop={true}
            slidesPerView={2}
            spaceBetween={16}
            grid={{
              rows: 1,
              fill: "row",
            }}
            breakpoints={{
              768: {
                slidesPerView: 4,
                spaceBetween: 28,
                grid: {
                  rows: 2,
                  fill: "row",
                },
              },
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              const totalSlides = swiper.slides.length;
              const slidesPerView = swiper.params.slidesPerView as number;
              const currentProgress = (swiper.realIndex + slidesPerView) / totalSlides;
              setProgressWidth(Math.min(currentProgress * 100, 100));
            }}
            onSlideChange={(swiper) => {
              const totalSlides = products.length;
              const slidesPerView = typeof swiper.params.slidesPerView === 'number' 
                ? swiper.params.slidesPerView 
                : 4;
              const currentIndex = swiper.realIndex;
              const visibleProducts = currentIndex + slidesPerView;
              const progress = Math.min(visibleProducts / totalSlides, 1);
              setProgressWidth(progress * 100);
            }}
            className="w-full"
          >
            {products.map((product, index) => (
              <SwiperSlide key={product.id} className="!h-auto">
                <Link href={`/goods/detail/${product.slug || product.id}`} className="block cursor-pointer" prefetch={true}>
                  <div className="relative w-full">
                    {/* Rank Badge */}
                    <div className="absolute left-1 top-1 pc:left-2 pc:top-2 z-10 flex size-7 pc:size-9 items-center justify-center rounded-md pc:rounded-xl bg-primary font-bold text-white">
                      <span className="text-sm pc:text-base">{product.rank || index + 1}</span>
                    </div>

                    {/* Image */}
                    <div className="relative w-full pb-[100%] pc:pb-0 pc:h-[299px] mb-1.5 pc:mb-4 rounded-lg pc:rounded-[10px] overflow-hidden bg-gray-100">
                      {product.image && product.image !== "#" && (product.image.startsWith("/") || product.image.startsWith("http")) ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 20vw"
                          loading={index < 4 ? "eager" : "lazy"}
                          className="object-contain"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <span>No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="relative flex flex-col items-start">
                      <p className="text-xs pc:text-sm text-gray-500 mb-1 line-clamp-1">
                        {product.brand}
                      </p>
                      <p className="text-sm pc:text-base line-clamp-2 mt-1">
                        {product.name}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm pc:text-base font-bold text-primary">
                            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                          </span>
                        )}
                        <Price amount={product.price} className="text-sm pc:text-base font-bold" />
                        {product.originalPrice && product.originalPrice > product.price && (
                          <Price amount={product.originalPrice} className="text-xs pc:text-sm text-gray-400 line-through" />
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation - Bottom */}
          <div className="flex items-center mt-8">
            {/* Progressbar */}
            <div className="flex-1 h-[2px] bg-gray-200 relative">
              <div 
                className="absolute left-0 top-0 h-full bg-black transition-all duration-300"
                style={{ width: `${progressWidth}%` }}
              />
            </div>
            
            {/* Buttons */}
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                onClick={() => swiperRef.current?.slideNext()}
                className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
