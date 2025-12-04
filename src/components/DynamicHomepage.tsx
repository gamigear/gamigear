"use client";

import { useState, useEffect } from "react";
import HeaderWithHero from "@/components/HeaderWithHero";
import QuickMenu from "@/components/QuickMenu";
import ProductSection from "@/components/ProductSection";
import ReviewSection from "@/components/ReviewSection";
import PromotionSlider from "@/components/PromotionSlider";
import BestProductSlider from "@/components/BestProductSlider";
import CouponBanner from "@/components/CouponBanner";
import TrendingProducts from "@/components/TrendingProducts";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";
import { homepageTranslations } from "@/lib/i18n/shop-translations";

interface HomepageSection {
  id: string;
  type: string;
  title: string;
  enabled: boolean;
  settings: Record<string, any>;
}

import type { ProductData } from "@/lib/api";

interface DynamicHomepageProps {
  initialProducts: {
    best: ProductData[];
    new: ProductData[];
    books: ProductData[];
    tickets: ProductData[];
  };
}

export default function DynamicHomepage({ initialProducts }: DynamicHomepageProps) {
  const { locale } = useShopTranslation();
  const [mounted, setMounted] = useState(false);
  const t = homepageTranslations[mounted ? locale : 'ko'];
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [customProducts, setCustomProducts] = useState<Record<string, ProductData[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchHomepageSettings();
  }, []);

  const fetchHomepageSettings = async () => {
    try {
      const response = await fetch("/api/homepage");
      const data = await response.json();
      
      if (data.settings?.sections) {
        setSections(data.settings.sections);
        
        // Fetch products for custom sections
        const customSections = data.settings.sections.filter(
          (s: HomepageSection) => s.type === "products" && s.id.startsWith("custom-")
        );
        
        for (const section of customSections) {
          await fetchProductsForSection(section);
        }
      }
    } catch (error) {
      console.error("Failed to fetch homepage settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsForSection = async (section: HomepageSection) => {
    try {
      const params = new URLSearchParams({
        per_page: (section.settings.limit || 8).toString(),
        status: "publish",
      });
      
      if (section.settings.category) {
        params.append("category", section.settings.category);
      }
      if (section.settings.featured) {
        params.append("featured", "true");
      }

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();
      
      setCustomProducts((prev) => ({
        ...prev,
        [section.id]: data.data?.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.slug || p.id,
          price: p.salePrice || p.price,
          originalPrice: p.regularPrice,
          image: p.images?.[0]?.src || p.images?.[0] || "",
          rating: p.averageRating,
          reviewCount: p.ratingCount,
          brand: p.brand?.name,
          category: p.categories?.[0]?.name,
          categoryId: p.categories?.[0]?.id,
        })) || [],
      }));
    } catch (error) {
      console.error("Failed to fetch products for section:", error);
    }
  };

  const renderSection = (section: HomepageSection) => {
    if (!section.enabled) return null;

    switch (section.id) {
      case "hero":
        return <HeaderWithHero key={section.id} />;
      
      case "quick-menu":
        return <QuickMenu key={section.id} />;
      
      case "best-products":
        return (
          <BestProductSlider 
            key={section.id} 
            products={initialProducts.best.slice(0, section.settings.limit || 12)} 
            title={t.sections.bestSellers}
          />
        );
      
      case "new-products":
        return (
          <ProductSection
            key={section.id}
            title={t.sections.newArrivals}
            subtitle=""
            products={initialProducts.new.slice(0, section.settings.limit || 8)}
            viewAllLink="/category/new"
          />
        );
      
      case "promotions":
        return <PromotionSlider key={section.id} />;
      
      case "reviews":
        return <ReviewSection key={section.id} />;
      
      case "books":
        return initialProducts.books.length > 0 ? (
          <ProductSection
            key={section.id}
            title={section.title || t.sections.featured}
            subtitle=""
            products={initialProducts.books.slice(0, section.settings.limit || 8)}
            viewAllLink="/category/books"
          />
        ) : null;
      
      case "tickets":
        return initialProducts.tickets.length > 0 ? (
          <ProductSection
            key={section.id}
            title={section.title || t.sections.featured}
            subtitle=""
            products={initialProducts.tickets.slice(0, section.settings.limit || 8)}
            viewAllLink="/category/tickets"
          />
        ) : null;
      
      case "coupon-banner":
        return <CouponBanner key={section.id} />;
      
      case "trending":
        return (
          <TrendingProducts 
            key={section.id} 
            title={section.title}
            limit={section.settings.limit || 16}
            settings={section.settings}
          />
        );
      
      default:
        // Custom product sections
        if (section.type === "products" && section.id.startsWith("custom-")) {
          const products = customProducts[section.id] || [];
          if (products.length === 0) return null;
          
          return (
            <ProductSection
              key={section.id}
              title={section.title}
              subtitle=""
              products={products}
              viewAllLink={section.settings.category ? `/category/${section.settings.category}` : "/products"}
            />
          );
        }
        return null;
    }
  };

  // Default sections if no settings loaded
  const defaultSections: HomepageSection[] = [
    { id: "hero", type: "hero", title: "Hero Banner", enabled: true, settings: {} },
    { id: "quick-menu", type: "quick-menu", title: "Quick Menu", enabled: true, settings: {} },
    { id: "best-products", type: "products", title: t.sections.bestSellers, enabled: true, settings: { limit: 12 } },
    { id: "trending", type: "trending", title: "Xem giỏ hàng của người khác", enabled: true, settings: { limit: 16 } },
    { id: "new-products", type: "products", title: t.sections.newArrivals, enabled: true, settings: { limit: 8 } },
    { id: "promotions", type: "promotions", title: "Promotions", enabled: true, settings: {} },
    { id: "reviews", type: "reviews", title: "Reviews", enabled: true, settings: {} },
    { id: "books", type: "products", title: t.sections.featured, enabled: true, settings: { limit: 8 } },
    { id: "tickets", type: "products", title: t.sections.featured, enabled: true, settings: { limit: 8 } },
    { id: "coupon-banner", type: "coupon-banner", title: "Coupon Banner", enabled: true, settings: {} },
  ];

  const sectionsToRender = sections.length > 0 ? sections : defaultSections;

  return <>{sectionsToRender.map(renderSection)}</>;
}
