"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

interface TopBanner {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image: string;
  tabletImage?: string | null;
  mobileImage?: string | null;
  link: string;
  gradientFrom: string;
  gradientTo: string;
  gradientAngle?: number;
  category?: string;
  isActive: boolean;
}

// Default banners
const defaultBanners: TopBanner[] = [
  {
    id: "1",
    title: "Gaming Keyboard\nMechanical Pro",
    subtitle: "Sản phẩm bán chạy nhất tháng này",
    description: "Switch Cherry MX chính hãng\nĐèn LED RGB 16.8 triệu màu\nKeycap PBT Double-shot\nKết nối USB-C có thể tháo rời\nBảo hành 24 tháng",
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&h=500&fit=crop",
    link: "/category/keyboards",
    gradientFrom: "#052566",
    gradientTo: "#3764be",
    gradientAngle: 100,
    category: "all",
    isActive: true,
  },
  {
    id: "2",
    title: "Gaming Mouse\nPro Wireless",
    subtitle: "Công nghệ không dây tiên tiến",
    description: "Sensor PAW3395 25,600 DPI\nTrọng lượng siêu nhẹ 58g\nPin sử dụng 70 giờ liên tục\nKết nối 2.4GHz & Bluetooth\nThiết kế Ergonomic",
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&h=500&fit=crop",
    link: "/category/mice",
    gradientFrom: "#1eb083",
    gradientTo: "#9decad",
    gradientAngle: 100,
    category: "all",
    isActive: true,
  },
  {
    id: "3",
    title: "Gaming Headset\n7.1 Surround",
    subtitle: "Âm thanh vòm chân thực",
    description: "Driver 50mm Hi-Res Audio\nÂm thanh vòm 7.1 ảo\nMic khử tiếng ồn AI\nĐệm tai Memory Foam\nTương thích PC/PS5/Xbox",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=500&fit=crop",
    link: "/category/headsets",
    gradientFrom: "#f36a2c",
    gradientTo: "#f6a868",
    gradientAngle: 100,
    category: "all",
    isActive: true,
  },
];

export default function TopBannerSlider() {
  const [banners, setBanners] = useState<TopBanner[]>(defaultBanners);
  const [mounted, setMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch("/api/banners?active=true");
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        // Transform banner data
        const transformedBanners = data.data.map((b: any) => ({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle,
          description: b.description || null,
          image: b.image,
          tabletImage: b.tabletImage || null,
          mobileImage: b.mobileImage || null,
          link: b.link,
          gradientFrom: b.gradientFrom || "#052566",
          gradientTo: b.gradientTo || "#3764be",
          gradientAngle: b.gradientAngle || 100,
          category: b.category || "all",
          isActive: b.isActive,
        }));
        setBanners(transformedBanners);
      }
    } catch (error) {
      console.error("Failed to fetch banners:", error);
    }
  };

  const filters = [
    { id: "all", label: "Tất cả" },
    { id: "keyboard", label: "Bàn phím" },
    { id: "mouse", label: "Chuột" },
    { id: "headset", label: "Tai nghe" },
  ];

  if (!mounted) {
    return (
      <div className="w-full h-[420px] pc:h-[480px] bg-gradient-to-r from-blue-900 to-blue-600" />
    );
  }

  return (
    <section className="index-top relative w-full">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop={banners.length > 1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          el: ".top-banner-pagination",
          bulletClass: "top-banner-bullet",
          bulletActiveClass: "top-banner-bullet-active",
        }}
        navigation={{
          nextEl: ".top-banner-next",
          prevEl: ".top-banner-prev",
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        className="w-full"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div
              className="banner-slide w-full"
              style={{
                background: `linear-gradient(${banner.gradientAngle || 100}deg, ${banner.gradientFrom} 0%, ${banner.gradientTo} 100%)`,
              }}
            >
              <Link href={banner.link} className="block">
                <div className="banner-container mx-auto w-full max-w-[1280px] px-5">
                  {/* Desktop Layout */}
                  <div className="banner-desktop">
                    {/* Content - Left */}
                    <div className="banner-content">
                      {banner.subtitle && (
                        <p className="banner-subtitle">
                          {banner.subtitle}
                        </p>
                      )}
                      <h2 className="banner-title">
                        {banner.title}
                      </h2>
                      {banner.description && (
                        <div className="banner-desc">
                          {banner.description}
                        </div>
                      )}
                      <div className="banner-cta">
                        <span>Xem chi tiết →</span>
                      </div>
                    </div>

                    {/* Image - Right (Desktop/Tablet) */}
                    <div className="banner-image-desktop">
                      <Image
                        src={banner.tabletImage || banner.image}
                        alt={banner.title}
                        fill
                        className="object-contain object-right"
                        priority
                      />
                    </div>
                  </div>
                  
                  {/* Mobile Layout */}
                  <div className="banner-mobile">
                    {/* Image - Top on Mobile */}
                    <div className="banner-image-mobile">
                      <Image
                        src={banner.mobileImage || banner.tabletImage || banner.image}
                        alt={banner.title}
                        fill
                        className="object-contain object-center"
                        priority
                      />
                    </div>
                    
                    {/* Content - Bottom on Mobile */}
                    <div className="banner-content-mobile">
                      {banner.subtitle && (
                        <p className="banner-subtitle-mobile">
                          {banner.subtitle}
                        </p>
                      )}
                      <h2 className="banner-title-mobile">
                        {banner.title}
                      </h2>
                      <div className="banner-cta-mobile">
                        <span>Xem chi tiết →</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Arrows */}
      <button className="top-banner-prev absolute left-4 pc:left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 pc:w-14 pc:h-14 flex items-center justify-center bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white transition-all shadow-lg">
        <img src="https://cdn.i-screammall.co.kr/files/x2bee-hi-store-cdn/public/images/icons/common/ico_chevron_left_tight_64.svg" alt="prev" width={28} height={28} className="invert" />
      </button>
      <button className="top-banner-next absolute right-4 pc:right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 pc:w-14 pc:h-14 flex items-center justify-center bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white transition-all shadow-lg">
        <img src="https://cdn.i-screammall.co.kr/files/x2bee-hi-store-cdn/public/images/icons/common/ico_chevron_right_tight_64.svg" alt="next" width={28} height={28} className="invert" />
      </button>

      {/* Bottom Bar: Pagination + Filters */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4">
          <div className="flex items-center justify-between py-4 pc:py-5">
            {/* Pagination Dots */}
            <div className="top-banner-pagination flex gap-2" />

            {/* Category Filters - Desktop only */}
            <div className="hidden pc:flex items-center gap-4 text-sm">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`transition-colors ${
                    activeFilter === filter.id
                      ? "text-white font-medium"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .index-top .swiper {
          overflow: visible;
        }
        .top-banner-pagination {
          display: flex;
          gap: 8px;
        }
        .top-banner-bullet {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          transition: all 0.3s;
        }
        .top-banner-bullet-active {
          background: white;
        }
        .top-banner-bullet:hover {
          background: rgba(255, 255, 255, 0.7);
        }
        
        /* Banner Slide Styles */
        .banner-slide {
          min-height: 480px;
        }
        
        /* Desktop Layout - default */
        .banner-desktop {
          display: flex;
          align-items: center;
          min-height: 480px;
          padding: 64px 0;
          position: relative;
        }
        .banner-content {
          flex: 1;
          padding-right: 48px;
          max-width: 600px;
          position: relative;
          z-index: 10;
        }
        .banner-subtitle {
          color: rgba(255,255,255,0.8);
          font-size: 16px;
          margin-bottom: 16px;
        }
        .banner-title {
          color: #fff;
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 24px;
          white-space: pre-line;
          line-height: 1.2;
        }
        .banner-desc {
          color: rgba(255,255,255,0.9);
          font-size: 16px;
          line-height: 1.8;
          white-space: pre-line;
          margin-bottom: 24px;
        }
        .banner-cta span {
          display: inline-block;
          padding: 8px 16px;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(4px);
          border-radius: 9999px;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
        }
        .banner-image-desktop {
          width: 500px;
          height: 380px;
          position: relative;
          flex-shrink: 0;
        }
        
        /* Mobile Layout - hidden by default */
        .banner-mobile {
          display: none;
        }
        
        /* Mobile Styles */
        @media (max-width: 767px) {
          .banner-slide {
            min-height: 400px;
          }
          
          /* Hide desktop, show mobile */
          .banner-desktop {
            display: none !important;
          }
          .banner-mobile {
            display: flex !important;
            flex-direction: column;
            min-height: 400px;
            padding: 24px 0;
          }
          
          .banner-image-mobile {
            position: relative;
            width: 100%;
            height: 180px;
            margin-bottom: 16px;
          }
          
          .banner-content-mobile {
            flex: 1;
            position: relative;
            z-index: 10;
            text-align: center;
            padding: 0 8px;
          }
          .banner-subtitle-mobile {
            color: rgba(255,255,255,0.8);
            font-size: 14px;
            margin-bottom: 8px;
          }
          .banner-title-mobile {
            color: #fff;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 12px;
            white-space: pre-line;
            line-height: 1.2;
          }
          .banner-cta-mobile {
            display: flex;
            justify-content: center;
          }
          .banner-cta-mobile span {
            display: inline-block;
            padding: 8px 16px;
            background: rgba(255,255,255,0.2);
            backdrop-filter: blur(4px);
            border-radius: 9999px;
            color: #fff;
            font-size: 12px;
            font-weight: 500;
          }
        }
        
        /* Tablet Styles */
        @media (min-width: 768px) and (max-width: 1024px) {
          .banner-slide {
            min-height: 420px;
          }
          .banner-desktop {
            min-height: 420px;
            padding: 40px 0;
          }
          .banner-title {
            font-size: 32px;
          }
          .banner-desc {
            display: none;
          }
          .banner-image-desktop {
            width: 300px;
            height: 280px;
          }
        }
      `}</style>
    </section>
  );
}
