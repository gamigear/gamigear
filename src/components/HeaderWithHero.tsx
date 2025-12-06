"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Menu, X, ChevronDown, User, Globe } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";
import LanguageSwitcher from "./LanguageSwitcher";
import CurrencySwitcher from "./CurrencySwitcher";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/navigation";

interface BannerCategory {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  buttonText?: string | null;
  image: string;
  tabletImage?: string | null;
  mobileImage?: string | null;
  link: string;
  gradientFrom: string;
  gradientTo: string;
  categoryId?: string | null;
  category?: BannerCategory | null;
}

const defaultMenus = {
  topbar: [
    { id: "1", name: "Gamigear", href: "/", isExternal: false, isActive: true },
    { id: "2", name: "Blog", href: "/blog", isExternal: false, isActive: true },
  ],
  main: [
    { id: "1", name: "Danh mục", href: "/categories", isExternal: false, isActive: true },
    { id: "2", name: "Bán chạy", href: "/category/best", isExternal: false, isActive: true },
    { id: "3", name: "Sản phẩm mới", href: "/category/new", isExternal: false, isActive: true },
    { id: "4", name: "Khuyến mãi", href: "/category/sale", isExternal: false, isActive: true, highlight: true },
    { id: "5", name: "Blog", href: "/blog", isExternal: false, isActive: true },
  ],
};

interface HeaderWithHeroProps {
  initialBanners?: Banner[];
  initialCategories?: BannerCategory[];
}

export default function HeaderWithHero({ 
  initialBanners = [], 
  initialCategories = [] 
}: HeaderWithHeroProps) {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const { itemCount, isHydrated: cartHydrated } = useCart();
  const { t } = useShopTranslation();
  const [mounted, setMounted] = useState(false);
  // Use initial data from server, no loading state needed if data exists
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [categories, setCategories] = useState<BannerCategory[]>(initialCategories);
  const [menus, setMenus] = useState(defaultMenus);
  // Only show loading if no initial data provided
  const [isLoading, setIsLoading] = useState(initialBanners.length === 0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState(""); // category id
  const [isMobileLangOpen, setIsMobileLangOpen] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);
  const { locale, setLocale } = useShopTranslation();
  const [logoUrl, setLogoUrl] = useState<string>("");
  
  const languages = [
    { code: "ko" as const, name: "한국어", flag: "🇰🇷" },
    { code: "en" as const, name: "English", flag: "🇺🇸" },
    { code: "vi" as const, name: "Tiếng Việt", flag: "🇻🇳" },
  ];

  useEffect(() => {
    setMounted(true);
    // Only fetch if no initial data provided (fallback for non-homepage usage)
    if (initialBanners.length === 0) {
      fetchData();
    } else {
      // Still fetch menus and settings, but don't block banner rendering
      fetchMenusAndSettings();
    }
  }, []);

  // Lightweight fetch for menus and settings only (non-blocking)
  const fetchMenusAndSettings = async () => {
    try {
      const [menusRes, settingsRes] = await Promise.all([
        fetch("/api/menus"),
        fetch("/api/settings"),
      ]);
      
      const [menusData, settingsData] = await Promise.all([
        menusRes.json(),
        settingsRes.json(),
      ]);
      
      if (settingsData.settings?.logoTransparent) {
        setLogoUrl(settingsData.settings.logoTransparent);
      }
      if (menusData.data) setMenus(menusData.data);
    } catch (error) {
      console.error("Failed to fetch menus/settings:", error);
    }
  };

  // Full fetch for fallback (when no initial data)
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [bannersRes, menusRes, categoriesRes, settingsRes] = await Promise.all([
        fetch("/api/banners?active=true"),
        fetch("/api/menus"),
        fetch("/api/banner-categories?active=true"),
        fetch("/api/settings"),
      ]);
      
      const settingsData = await settingsRes.json();
      if (settingsData.settings?.logoTransparent) {
        setLogoUrl(settingsData.settings.logoTransparent);
      }

      const bannersData = await bannersRes.json();
      const menusData = await menusRes.json();
      const categoriesData = await categoriesRes.json();

      if (bannersData.data?.length > 0) {
        const transformed = bannersData.data.map((b: any) => ({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle,
          description: b.description || null,
          buttonText: b.buttonText || null,
          image: b.image,
          tabletImage: b.tabletImage || null,
          mobileImage: b.mobileImage || null,
          link: b.link,
          gradientFrom: b.gradientFrom || "#052566",
          gradientTo: b.gradientTo || "#3764be",
          categoryId: b.categoryId || null,
          category: b.category || null,
        }));
        setBanners(transformed);
      }
      if (menusData.data) setMenus(menusData.data);
      if (categoriesData.data) setCategories(categoriesData.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  // Build filters from categories - only show categories that have banners
  const categoriesWithBanners = categories.filter(cat => 
    banners.some(b => b.categoryId === cat.id)
  );
  
  const filters = categoriesWithBanners.map(cat => ({ id: cat.id, label: cat.name }));

  // Filter banners by category (only show banners belonging to selected category)
  const filteredBanners = banners.filter(b => b.categoryId === activeFilter);

  // Set default filter to first category with banners when data loads
  useEffect(() => {
    if (categoriesWithBanners.length > 0 && !activeFilter) {
      setActiveFilter(categoriesWithBanners[0].id);
    }
  }, [categoriesWithBanners, activeFilter]);

  // Reset swiper to first slide when filter changes
  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(0);
    }
  }, [activeFilter]);

  const topMenuLinks = menus.topbar?.filter((item) => item.isActive) || [];
  const mainNavLinks = menus.main?.filter((item) => item.isActive) || [];

  return (
    <div className="header-hero-wrapper">
      {/* ===== MOBILE HEADER - Only visible on mobile, renders first in DOM ===== */}
      <header className="hd-mobile pc:hidden">
        <div className="hd-top">
          <div className="hd-contain">
            {/* Left - Menu icon */}
            <div className="hd-mobile-left">
              <button type="button" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu size={24} />
              </button>
            </div>
            
            {/* Center - Logo */}
            <h1 className="hd-mobile-center">
              <Link href="/">
                {mounted && logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="mobile-logo-img" />
                ) : (
                  <span className="logo-text">GAMIGEAR</span>
                )}
              </Link>
            </h1>
            
            {/* Right - User & Language icons */}
            <div className="hd-mobile-right">
              <Link href={isAuthenticated ? "/mypage" : "/login"} className="mobile-icon-btn">
                <User size={22} />
              </Link>
              <div className="relative">
                <button 
                  type="button" 
                  className="mobile-icon-btn mobile-lang-btn"
                  onClick={() => setIsMobileLangOpen(!isMobileLangOpen)}
                >
                  <Globe size={22} />
                </button>
                {isMobileLangOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsMobileLangOpen(false)} />
                    <div className="mobile-lang-dropdown">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLocale(lang.code);
                            setIsMobileLangOpen(false);
                          }}
                          className={`mobile-lang-option ${locale === lang.code ? "active" : ""}`}
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="hd-search-mo">
          <form 
            className="mobile-search-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
              }
            }}
          >
            <Search size={18} className="mobile-search-icon" />
            <input
              type="text"
              className="mobile-search-input"
              placeholder={mounted ? t.header.searchPlaceholder : "Tìm kiếm sản phẩm..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </header>

      {/* ===== HERO SLIDER SECTION ===== */}
      <section className="index-top">
        {isLoading ? (
          <div className="hero-loading" style={{ background: "linear-gradient(100deg, #052566 0%, #3764be 100%)" }}>
            <div className="loading-spinner" />
          </div>
        ) : filteredBanners.length > 0 ? (
          <>
          <Swiper
            key={activeFilter} // Force re-render when filter changes
            modules={[Navigation, Pagination, Autoplay, EffectFade]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            loop={filteredBanners.length > 1}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{
              clickable: true,
              dynamicBullets: false,
            }}
            navigation={{
              prevEl: ".hero-nav-prev",
              nextEl: ".hero-nav-next",
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            className="hero-swiper"
          >
            {filteredBanners.map((banner, index) => (
              <SwiperSlide
                key={banner.id}
                style={{
                  background: `linear-gradient(100deg, ${banner.gradientFrom || "#052566"} 0%, ${banner.gradientTo || "#3764be"} 100%)`,
                }}
              >
                <Link href={banner.link} className="slide-link">
                  {/* Desktop Layout */}
                  <div className="contain desktop-layout">
                    <div className="cont">
                      {banner.subtitle && (
                        <p className="slide-subtitle">{banner.subtitle}</p>
                      )}
                      <h2 className="slide-title">{banner.title}</h2>
                      {banner.description && (
                        <div className="slide-desc">{banner.description}</div>
                      )}
                      {banner.buttonText && (
                        <div className="slide-btn">
                          <span>{banner.buttonText}</span>
                        </div>
                      )}
                    </div>
                    <div className="img">
                      <Image
                        src={banner.tabletImage || banner.image}
                        alt={banner.title}
                        width={500}
                        height={400}
                        className="object-contain"
                        priority={index === 0}
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  </div>
                  
                  {/* Mobile Layout */}
                  <div className="contain mobile-layout">
                    <div className="mobile-img">
                      <Image
                        src={banner.mobileImage || banner.tabletImage || banner.image}
                        alt={banner.title}
                        width={400}
                        height={200}
                        className="object-contain"
                        priority={index === 0}
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </div>
                    <div className="mobile-cont">
                      {banner.subtitle && (
                        <p className="slide-subtitle">{banner.subtitle}</p>
                      )}
                      <h2 className="slide-title">{banner.title}</h2>
                      {banner.description && (
                        <div className="slide-desc mobile">{banner.description}</div>
                      )}
                      {banner.buttonText && (
                        <div className="slide-btn mobile">
                          <span>{banner.buttonText}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
          
          {/* Custom Navigation Buttons */}
          {filteredBanners.length > 1 && (
            <>
              <button className="hero-nav-prev" aria-label="Previous slide">
                <img src="https://www.cedubook.com/images/main/top-swiper-prev.svg" alt="prev" />
              </button>
              <button className="hero-nav-next" aria-label="Next slide">
                <img src="https://www.cedubook.com/images/main/top-swiper-next.svg" alt="next" />
              </button>
            </>
          )}
          </>
        ) : (
          <div className="hero-empty" style={{ background: "linear-gradient(100deg, #052566 0%, #3764be 100%)" }}>
            <p>Chưa có banner nào</p>
          </div>
        )}

        {/* Filter Tabs - chỉ hiển thị khi có banners */}
        {!isLoading && filteredBanners.length > 0 && (
          <div className="swiper-skip">
            <ul>
              {filters.map((filter) => (
                <li key={filter.id}>
                  <button
                    onClick={() => setActiveFilter(filter.id)}
                    className={activeFilter === filter.id ? "on" : ""}
                  >
                    {filter.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ===== DESKTOP HEADER - Position absolute, nằm đè lên hero (hidden on mobile) ===== */}
      <header className="hd hidden pc:block">
        {/* Top Banner Bar - hd-bn */}
        <div
          className="hd-bn hidden pc:block"
          style={{
            backgroundImage: "url('https://www.cedubook.com/images/common/hd-link-bg-index.png')",
            backgroundRepeat: "repeat-x",
            backgroundPosition: "center",
          }}
        >
          <div className="hd-contain">
            <div className="family">
              {topMenuLinks.map((link, index) => (
                <Link key={link.id} href={link.href} className={index === 1 ? "active" : ""}>
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>
            <div className="text-banner">
              <Link href="/promotions">
                <svg className="hd-bn-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>
                  <strong>Ưu đãi đặc biệt! </strong>
                  <span className="highlight-text">Giảm đến 50%</span>
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Header - hd-top */}
        <div className="hd-top">
          <div className="hd-contain">
            <h1>
              <Link href="/">
                {mounted && logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="desktop-logo-img" />
                ) : (
                  <span className="logo-text">GAMIGEAR</span>
                )}
              </Link>
            </h1>

            <div className="top-search-wrap hidden pc:flex">
              <form 
                className="top-search"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
                  }
                }}
              >
                <input
                  type="text"
                  className="search-input"
                  placeholder={mounted ? t.header.searchPlaceholder : "Tìm kiếm sản phẩm..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="btn-icon-search">
                  <Search size={18} />
                </button>
              </form>
            </div>

            <div className="top-member hidden pc:flex">
              <CurrencySwitcher variant="light" />
              <span className="text-white/30 mx-2">|</span>
              <LanguageSwitcher />
              {!mounted || loading ? (
                <span className="text-white/50">...</span>
              ) : isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="user-btn"
                  >
                    <span>{user.lastName}{user.firstName}</span>
                    <ChevronDown size={14} />
                  </button>
                  {isUserMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                      <div className="user-dropdown">
                        <Link href="/mypage" onClick={() => setIsUserMenuOpen(false)}>
                          {mounted ? t.mypage.title : "Tài khoản"}
                        </Link>
                        <Link href="/orders" onClick={() => setIsUserMenuOpen(false)}>
                          {mounted ? t.mypage.orders : "Đơn hàng"}
                        </Link>
                        {user.role === "administrator" && (
                          <Link href="/admin" onClick={() => setIsUserMenuOpen(false)}>Admin</Link>
                        )}
                        <hr />
                        <button onClick={handleLogout} className="logout-btn">
                          {mounted ? t.auth.logout : "Đăng xuất"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/login">{mounted ? t.auth.login : "Đăng nhập"}</Link>
                  <Link href="/register">{mounted ? t.auth.register : "Đăng ký"}</Link>
                </>
              )}
            </div>

          </div>
        </div>

        {/* Navigation - hd-gnb */}
        <div className="hd-gnb hidden pc:block">
          <div className="hd-contain">
            <button type="button" className="btn-sitemap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
            <ul className="gnb">
              {mainNavLinks.map((link) => (
                <li key={link.id}>
                  <Link href={link.href} className={link.highlight ? "highlight" : ""}>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="hd-side">
              <Link href="/events" className="flex items-center gap-1.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Sự kiện
              </Link>
              <Link href="/cart" className="cart-link flex items-center gap-1.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Giỏ hàng
                {mounted && cartHydrated && itemCount > 0 && <span className="cart-count">{itemCount > 99 ? "99+" : itemCount}</span>}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ===== MOBILE MENU ===== */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-backdrop" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="mobile-menu">
            <div className="mobile-menu-header">
              <span>Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
            </div>
            <nav className="mobile-menu-nav">
              {mainNavLinks.map((link) => (
                <Link key={link.id} href={link.href} onClick={() => setIsMobileMenuOpen(false)}>
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* ===== STYLES ===== */}
      <style jsx global>{`
        .header-hero-wrapper {
          position: relative;
        }

        /* Loading & Empty States */
        .hero-loading, .hero-empty {
          min-height: 600px;
          padding-top: 170px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .hero-empty p {
          color: rgba(255,255,255,0.6);
          font-size: 16px;
        }

        /* ===== HEADER - Absolute position ===== */
        .hd {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
        }

        /* Top Banner */
        .hd-bn {
          height: 50px;
        }
        .hd-contain {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 20px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .family {
          display: flex;
          gap: 0;
        }
        .family a {
          min-width: 92px;
          padding: 0 12px;
          font-size: 13px;
          font-weight: 600;
          color: rgba(0,0,0,0.6);
          line-height: 50px;
          text-align: center;
        }
        .family a.active {
          color: #fff;
        }
        .text-banner a {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #333;
        }
        .hd-bn-ico { color: #f97316; }
        .highlight-text { color: #ea580c; font-weight: 600; }

        /* Main Header */
        .hd-top {
          height: 70px;
        }
        .hd-top .hd-contain {
          gap: 24px;
        }
        .logo-text {
          font-size: 24px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.5px;
          white-space: nowrap;
        }
        .desktop-logo-img {
          height: 40px;
          width: auto;
          object-fit: contain;
        }
        .mobile-logo-img {
          height: 32px;
          width: auto;
          object-fit: contain;
        }
        .top-search-wrap {
          width: 350px;
          flex-shrink: 0;
        }
        .top-search {
          display: flex;
          align-items: center;
          width: 100%;
          height: 44px;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 22px;
          padding: 0 16px;
        }
        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: 14px;
          color: #333;
        }
        .search-input::placeholder { color: #9ca3af; }
        .btn-icon-search {
          color: #6b7280;
          transition: color 0.2s;
        }
        .btn-icon-search:hover { color: #374151; }
        .top-member {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 13px;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .top-member a {
          color: rgba(255,255,255,0.8);
          transition: color 0.2s;
        }
        .top-member a:hover { color: #fff; }
        .user-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          color: rgba(255,255,255,0.8);
        }
        .user-btn:hover { color: #fff; }
        .user-dropdown {
          position: absolute;
          right: 0;
          top: 100%;
          margin-top: 8px;
          width: 180px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          padding: 8px 0;
          z-index: 50;
        }
        .user-dropdown a, .user-dropdown button {
          display: block;
          width: 100%;
          padding: 10px 16px;
          font-size: 14px;
          color: #374151;
          text-align: left;
        }
        .user-dropdown a:hover, .user-dropdown button:hover {
          background: #f3f4f6;
        }
        .user-dropdown hr {
          margin: 4px 0;
          border-color: #e5e7eb;
        }
        .logout-btn { color: #dc2626 !important; }
        .hd-top-mo {
          display: flex;
          gap: 12px;
        }
        .hd-top-mo button { color: #fff; }

        /* Navigation */
        .hd-gnb {
          height: 50px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .hd-gnb .hd-contain {
          gap: 32px;
        }
        .btn-sitemap {
          color: rgba(255,255,255,0.8);
          transition: color 0.2s;
        }
        .btn-sitemap:hover { color: #fff; }
        .gnb {
          display: flex;
          gap: 32px;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .gnb a {
          font-size: 15px;
          font-weight: 500;
          color: rgba(255,255,255,0.85);
          transition: color 0.2s;
        }
        .gnb a:hover { color: #fff; }
        .gnb a.highlight { color: #fbbf24; }
        .gnb a.highlight:hover { color: #fcd34d; }
        .hd-side {
          margin-left: auto;
          display: flex;
          gap: 20px;
        }
        .hd-side a {
          font-size: 14px;
          color: rgba(255,255,255,0.8);
          transition: color 0.2s;
        }
        .hd-side a:hover { color: #fff; }
        .cart-link { position: relative; }
        .cart-count {
          position: absolute;
          top: -8px;
          right: -14px;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          background: #ef4444;
          color: #fff;
          font-size: 10px;
          font-weight: 600;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ===== HERO SLIDER ===== */
        .index-top {
          position: relative;
          margin-bottom: 40px;
        }
        .hero-swiper {
          width: 100%;
        }
        /* Swiper slide - gradient background trực tiếp trên slide */
        .hero-swiper .swiper-slide {
          width: 100% !important;
          min-height: 600px;
          padding-top: 170px; /* Space for header */
        }
        .slide-link {
          display: block;
          width: 100%;
          height: 100%;
        }
        .index-top .contain {
          max-width: 1280px;
          margin: 0 auto;
          padding: 60px 20px 100px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .index-top .cont {
          flex: 1;
          max-width: 550px;
          padding-right: 40px;
        }
        .slide-subtitle {
          font-size: 15px;
          color: rgba(255,255,255,0.75);
          margin-bottom: 16px;
        }
        .slide-title {
          font-size: 38px;
          font-weight: 700;
          color: #fff;
          line-height: 1.25;
          margin-bottom: 24px;
          white-space: pre-line;
        }
        .slide-desc {
          font-size: 14px;
          color: rgba(255,255,255,0.7);
          line-height: 1.9;
          white-space: pre-line;
        }
        .slide-desc.mobile {
          font-size: 13px;
          line-height: 1.6;
          margin-top: 12px;
          text-align: center;
        }
        .slide-btn {
          margin-top: 24px;
        }
        .slide-btn span {
          display: inline-block;
          padding: 12px 28px;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(4px);
          border-radius: 30px;
          color: #fff;
          font-size: 15px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .slide-btn span:hover {
          background: rgba(255,255,255,0.3);
        }
        .slide-btn.mobile {
          margin-top: 16px;
        }
        .slide-btn.mobile span {
          padding: 10px 24px;
          font-size: 14px;
        }
        .index-top .img {
          width: 480px;
          height: 380px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .index-top .img img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        /* Pagination - Swiper default */
        .hero-swiper .swiper-pagination {
          bottom: 28px !important;
        }
        .hero-swiper .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: rgba(255,255,255,0.4);
          opacity: 1;
          margin: 0 5px !important;
        }
        .hero-swiper .swiper-pagination-bullet-active {
          background: #fff;
        }

        /* Filter Tabs - nằm trong layout 1280px */
        .swiper-skip {
          position: absolute;
          bottom: 24px;
          right: max(20px, calc((100vw - 1280px) / 2 + 20px));
          z-index: 10;
        }
        .swiper-skip ul {
          display: flex;
          gap: 20px;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .swiper-skip button {
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .swiper-skip button:hover,
        .swiper-skip button.on {
          color: #fff;
          font-weight: 500;
        }

        /* Custom Navigation Arrows */
        .hero-nav-prev,
        .hero-nav-next {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          display: none;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s;
          padding: 0;
        }
        .hero-nav-prev img,
        .hero-nav-next img {
          width: 70px;
          height: 70px;
        }
        .hero-nav-prev:hover,
        .hero-nav-next:hover {
          opacity: 0.7;
        }
        .hero-nav-prev {
          left: 50px;
        }
        .hero-nav-next {
          right: 50px;
        }
        @media (min-width: 1025px) {
          .hero-nav-prev,
          .hero-nav-next {
            display: flex;
          }
        }
        
        /* Hide default Swiper navigation */
        .hero-swiper .swiper-button-prev,
        .hero-swiper .swiper-button-next {
          display: none !important;
        }

        /* Mobile Menu */
        .mobile-menu-overlay {
          position: fixed;
          inset: 0;
          z-index: 700;
        }
        .mobile-menu-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
        }
        .mobile-menu {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 280px;
          background: #fff;
        }
        .mobile-menu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 56px;
          padding: 0 16px;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 600;
        }
        .mobile-menu-nav {
          padding: 16px;
        }
        .mobile-menu-nav a {
          display: block;
          padding: 14px 0;
          font-size: 16px;
          font-weight: 500;
          border-bottom: 1px solid #f3f4f6;
          color: #1f2937;
        }

        /* Mobile Header - separate header for mobile */
        .hd-mobile {
          background: #fff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .hd-mobile .hd-top {
          height: 56px;
        }
        .hd-mobile .hd-contain {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .hd-mobile-left {
          width: 80px;
          display: flex;
          align-items: center;
        }
        .hd-mobile-left button {
          color: #1f2937;
          padding: 4px;
        }
        .hd-mobile-center {
          flex: 1;
          text-align: center;
        }
        .hd-mobile .logo-text {
          color: #1f2937;
          font-size: 20px;
          font-weight: 700;
        }
        .hd-mobile-right {
          width: 80px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
        }
        .mobile-icon-btn {
          color: #1f2937;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mobile-icon-btn:hover {
          color: #4b5563;
        }
        .mobile-lang-dropdown {
          position: absolute;
          right: 0;
          top: 100%;
          margin-top: 8px;
          width: 140px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          padding: 4px 0;
          z-index: 50;
        }
        .mobile-lang-option {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 12px;
          font-size: 14px;
          color: #374151;
          text-align: left;
        }
        .mobile-lang-option:hover {
          background: #f3f4f6;
        }
        .mobile-lang-option.active {
          background: #f3f4f6;
          font-weight: 500;
        }
        
        /* Mobile Search Bar */
        .hd-search-mo {
          padding: 0 12px 12px;
          background: #fff;
        }
        .mobile-search-form {
          display: flex;
          align-items: center;
          width: 100%;
          height: 40px;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 0 14px;
          gap: 10px;
        }
        .mobile-search-icon {
          color: #6b7280;
          flex-shrink: 0;
        }
        .mobile-search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: 14px;
          color: #1f2937;
        }
        .mobile-search-input::placeholder {
          color: #9ca3af;
        }

        /* Desktop Layout - default visible */
        .index-top .desktop-layout {
          display: flex;
        }
        .index-top .mobile-layout {
          display: none;
        }
        
        /* Mobile Layout Styles */
        .index-top .mobile-layout {
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 20px 20px 60px;
        }
        .index-top .mobile-img {
          width: 100%;
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .index-top .mobile-img img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .index-top .mobile-cont {
          text-align: center;
        }
        .index-top .mobile-cont .slide-subtitle {
          margin-bottom: 8px;
        }
        .index-top .mobile-cont .slide-title {
          font-size: 24px;
          margin-bottom: 0;
        }

        /* Tablet Responsive */
        @media (max-width: 1024px) {
          .hd-top { height: 56px; }
          .hero-swiper .swiper-slide {
            min-height: 480px;
            padding-top: 56px;
          }
          .index-top .contain {
            padding: 40px 20px 80px;
          }
          .index-top .cont {
            max-width: 100%;
            padding-right: 20px;
          }
          .index-top .img {
            width: 300px;
            height: 280px;
          }
          .slide-title { font-size: 28px; }
          .swiper-skip { display: none; }
        }
        
        /* Mobile Responsive - Switch layouts */
        @media (max-width: 767px) {
          /* Hero slider - 60vh height on mobile */
          .hero-swiper .swiper-slide {
            min-height: 60vh;
            padding-top: 0 !important;
          }
          
          /* Hide desktop, show mobile */
          .index-top .desktop-layout {
            display: none !important;
          }
          .index-top .mobile-layout {
            display: flex !important;
            min-height: 60vh;
            padding: 24px 20px 40px;
            justify-content: center;
          }
          
          .index-top .mobile-img {
            height: 200px;
          }
          
          .slide-title { font-size: 22px; }
          .slide-subtitle { font-size: 13px; }
          
          /* Loading and empty states */
          .hero-loading, .hero-empty {
            min-height: 60vh;
            padding-top: 0;
          }
        }
      `}</style>
    </div>
  );
}
