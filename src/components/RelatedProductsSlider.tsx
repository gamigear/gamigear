"use client";

import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import ProductCard from "@/components/ProductCard";
import type { ProductData } from "@/lib/api";

const ICON_PREV = "https://cdn.i-screammall.co.kr/files/x2bee-hi-store-cdn/public/images/icons/common/ico_chevron_left_tight_64.svg";
const ICON_NEXT = "https://cdn.i-screammall.co.kr/files/x2bee-hi-store-cdn/public/images/icons/common/ico_chevron_right_tight_64.svg";

interface RelatedProductsSliderProps {
  title: string;
  products: ProductData[];
}

export default function RelatedProductsSlider({ title, products }: RelatedProductsSliderProps) {
  const swiperRef = useRef<SwiperType | null>(null);

  if (products.length === 0) return null;

  return (
    <section className="py-6 pc:py-12 bg-gray-50">
      <div className="mx-auto w-full max-w-[1280px] px-3 pc:px-4">
        <h2 className="text-lg pc:text-2xl font-bold mb-4 pc:mb-6">{title}</h2>

        <div className="relative">
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={12}
            slidesPerView={2.2}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            navigation={{
              prevEl: ".related-swiper-prev",
              nextEl: ".related-swiper-next",
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            breakpoints={{
              640: { slidesPerView: 3, spaceBetween: 16 },
              768: { slidesPerView: 4, spaceBetween: 16 },
              1024: { slidesPerView: 5, spaceBetween: 16 },
              1280: { slidesPerView: 6, spaceBetween: 16 },
            }}
            className="related-products-slider"
          >
            {products.map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Buttons */}
          <button 
            className="related-swiper-prev hidden pc:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-10 h-10 bg-white rounded-full items-center justify-center hover:bg-gray-50 transition-colors shadow-lg"
            aria-label="Previous"
          >
            <img src={ICON_PREV} alt="prev" width={20} height={20} />
          </button>
          <button 
            className="related-swiper-next hidden pc:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-10 h-10 bg-white rounded-full items-center justify-center hover:bg-gray-50 transition-colors shadow-lg"
            aria-label="Next"
          >
            <img src={ICON_NEXT} alt="next" width={20} height={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
