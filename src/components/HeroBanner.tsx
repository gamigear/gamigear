"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/pagination";

const defaultBanners = [
  {
    id: "1",
    subtitle: "Gaming Gear chất lượng cao cho game thủ chuyên nghiệp",
    title: "🎮 Gamigear - Thiết bị gaming cho nhà vô địch 🎮",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1280&h=520&fit=crop&q=80",
    mobileImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=750&h=812&fit=crop&q=80",
    link: "/category/gaming",
  },
  {
    id: "2",
    subtitle: "Bàn phím cơ RGB - Trải nghiệm gõ phím đỉnh cao",
    title: "⌨️ Flash Sale - Giảm đến 40% Bàn phím Gaming ⌨️",
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=1280&h=520&fit=crop&q=80",
    mobileImage: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=750&h=812&fit=crop&q=80",
    link: "/category/keyboards",
  },
  {
    id: "3",
    subtitle: "Chuột gaming DPI cao - Độ chính xác tuyệt đối",
    title: "🖱️ Chuột Gaming Pro - Chỉ từ 299.000₫ 🖱️",
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=1280&h=520&fit=crop&q=80",
    mobileImage: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=750&h=812&fit=crop&q=80",
    link: "/category/mouse",
  },
  {
    id: "4",
    subtitle: "Tai nghe gaming 7.1 surround - Âm thanh sống động",
    title: "🎧 Headset Gaming - Miễn phí vận chuyển 🎧",
    image: "https://images.unsplash.com/photo-1599669454699-248893623440?w=1280&h=520&fit=crop&q=80",
    mobileImage: "https://images.unsplash.com/photo-1599669454699-248893623440?w=750&h=812&fit=crop&q=80",
    link: "/category/headsets",
  },
];

export default function HeroBanner() {
  const swiperRef = useRef<SwiperType | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [banners, setBanners] = useState<any[]>(defaultBanners);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch("/api/banners");
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        // Filter out banners with invalid images
        const validBanners = data.data.filter((b: any) => 
          b.image && 
          b.image !== "#" && 
          (b.image.startsWith("/") || b.image.startsWith("http"))
        );
        if (validBanners.length > 0) {
          setBanners(validBanners);
        }
      }
    } catch (error) {
      console.error("Failed to fetch banners:", error);
    }
  };

  const toggleAutoplay = () => {
    if (isPlaying) {
      swiperRef.current?.autoplay.stop();
    } else {
      swiperRef.current?.autoplay.start();
    }
    setIsPlaying(!isPlaying);
  };

  if (!mounted) {
    return (
      <section className="w-full pc:mb-[120px] mo:mb-[40px]">
        <div className="swiper-type-full">
          <div className="mo:aspect-[375/406] pc:aspect-[1280/520] w-full bg-gray-100 animate-pulse" />
        </div>
      </section>
    );
  }

  // Filter valid banners before rendering
  const validBanners = banners.filter((b) => 
    b.image && 
    b.image !== "#" && 
    (b.image.startsWith("/") || b.image.startsWith("http"))
  );

  if (validBanners.length === 0) {
    return null;
  }

  return (
    <section className="w-full pc:mb-[120px] mo:mb-[40px] relative">
      {/* Navigation Buttons - Full Width */}
      {validBanners.length > 1 && (
        <>
          <button
            className="hero-swiper-prev hidden pc:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 items-center justify-center hover:opacity-70 transition-opacity"
            aria-label="Previous"
          >
            <img
              src="https://www.cedubook.com/images/main/top-swiper-prev.svg"
              alt="prev"
              className="w-[48px] h-[48px]"
            />
          </button>
          <button
            className="hero-swiper-next hidden pc:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 items-center justify-center hover:opacity-70 transition-opacity"
            aria-label="Next"
          >
            <img
              src="https://www.cedubook.com/images/main/top-swiper-next.svg"
              alt="next"
              className="w-[48px] h-[48px]"
            />
          </button>
        </>
      )}

      <div className="swiper-type-full relative">
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          loop={validBanners.length > 1}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          speed={500}
          spaceBetween={20}
          slidesPerView={1}
          centeredSlides={true}
          breakpoints={{
            1025: {
              slidesPerView: "auto",
              spaceBetween: 20,
            },
          }}
          navigation={{
            prevEl: ".hero-swiper-prev",
            nextEl: ".hero-swiper-next",
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => {
            setCurrentIndex(swiper.realIndex);
          }}
          className="mo:aspect-[375/406] pc:!overflow-visible"
        >
          {validBanners.map((banner) => (
            <SwiperSlide 
              key={banner.id} 
              className="pc:!w-[1280px] pc:!h-[520px]"
            >
              <Link
                href={banner.link || "#"}
                className="relative flex size-full justify-start pc:justify-center items-end pc:items-center overflow-hidden pc:rounded-[20px] mo:rounded-none"
              >
                {/* Mobile Image */}
                <div className="relative w-full h-full pc:hidden">
                  <Image
                    src={banner.mobileImage || banner.image}
                    alt={banner.title || "Banner"}
                    fill
                    className="object-cover"
                    priority
                    unoptimized
                  />
                </div>

                {/* Desktop Image */}
                <div className="relative w-[1280px] h-[520px] hidden pc:block">
                  <Image
                    src={banner.image}
                    alt={banner.title || "Banner"}
                    fill
                    className="object-cover"
                    priority
                    unoptimized
                  />
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pc:rounded-[20px]" />

                {/* Text Content */}
                <div className="absolute size-full inset-0 flex flex-col justify-end items-center pb-[48px] text-center mo:pb-[56px] text-white">
                  {banner.subtitle && (
                    <div className="mb-[6px] text-sm pc:text-base font-normal whitespace-pre-wrap mo:mb-[4px] px-4">
                      {banner.subtitle}
                    </div>
                  )}
                  <div className="text-xl pc:text-2xl font-bold whitespace-pre-wrap mo:text-lg px-4">
                    {banner.title}
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Pagination */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-black/50 text-white px-4 py-1.5 rounded-full text-sm font-medium">
            {currentIndex + 1} / {validBanners.length}
          </span>
        </div>

        {/* Play/Pause Control - Desktop Only */}
        {validBanners.length > 1 && (
          <div className="hidden pc:block absolute bottom-4 right-[calc(50%-620px)] z-10">
            <button
              type="button"
              onClick={toggleAutoplay}
              className="w-9 h-9 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
