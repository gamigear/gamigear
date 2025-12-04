"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import ProductCard from "@/components/ProductCard";
import type { ProductData } from "@/lib/api";

interface RelatedProductsSliderProps {
  title: string;
  products: ProductData[];
}

export default function RelatedProductsSlider({ title, products }: RelatedProductsSliderProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-6 pc:py-12 bg-gray-50">
      <div className="mx-auto w-full max-w-[1280px] px-3 pc:px-4">
        <h2 className="text-lg pc:text-2xl font-bold mb-4 pc:mb-6">{title}</h2>

        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={12}
          slidesPerView={2.2}
          navigation
          autoplay={{ delay: 5000, disableOnInteraction: false }}
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
      </div>

      <style jsx global>{`
        .related-products-slider .swiper-button-next,
        .related-products-slider .swiper-button-prev {
          width: 36px;
          height: 36px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .related-products-slider .swiper-button-next:after,
        .related-products-slider .swiper-button-prev:after {
          font-size: 14px;
          color: #333;
          font-weight: bold;
        }
        @media (max-width: 768px) {
          .related-products-slider .swiper-button-next,
          .related-products-slider .swiper-button-prev {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
