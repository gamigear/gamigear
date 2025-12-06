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
import BlogSlider from "@/components/BlogSlider";
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

interface DynamicHomepageProps {
  initialProducts: {
    best: ProductData[];
    new: ProductData[];
    books: ProductData[];
    tickets: ProductData[];
  };
  initialBanners?: Banner[];
  initialBannerCategories?: BannerCategory[];
}

export default function DynamicHomepage({ 
  initialProducts, 
  initialBanners = [], 
  initialBannerCategories = [] 
}: DynamicHomepageProps) {
  const { locale } = useShopTranslation();
  const [mounted, setMounted] = useState(false);
  const t = homepageTranslations[mounted ? locale : 'ko'];
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [customProducts, setCustomProducts] = useState<Record<string, ProductData[]>>({});
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchHomepageSettings();
  }, []);

  // Fetch blog posts when sections are loaded
  useEffect(() => {
    const blogSection = sections.find(s => s.id === "blog");
    if (blogSection || sections.length === 0) {
      fetchBlogPosts(blogSection);
    }
  }, [sections]);

  const fetchHomepageSettings = async () => {
    try {
      const response = await fetch("/api/homepage");
      const data = await response.json();
      
      if (data.settings?.sections) {
        setSections(data.settings.sections);
        
        // Fetch products for custom sections and sections with custom settings
        const dynamicSectionIds = ["new-products", "books", "tickets"];
        const sectionsNeedingFetch = data.settings.sections.filter(
          (s: HomepageSection) => 
            s.type === "products" && 
            (s.id.startsWith("custom-") || 
             (dynamicSectionIds.includes(s.id) && (s.settings.category || s.settings.selectionMode === "manual")))
        );
        
        for (const section of sectionsNeedingFetch) {
          await fetchProductsForSection(section);
        }
      }
    } catch (error) {
      console.error("Failed to fetch homepage settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogPosts = async (blogSection?: HomepageSection) => {
    try {
      const settings = blogSection?.settings || {};
      let url = "/api/posts?status=publish";
      
      if (settings.source === "manual" && settings.postIds?.length > 0) {
        // For manual selection, fetch all and filter
        url += "&per_page=100";
      } else {
        url += `&per_page=${settings.limit || 8}`;
        if (settings.source === "category" && settings.blogCategory) {
          url += `&category=${settings.blogCategory}`;
        }
      }
      
      const response = await fetch(url);
      const data = await response.json();
      let posts = data.data || [];
      
      // Filter for manual selection
      if (settings.source === "manual" && settings.postIds?.length > 0) {
        posts = posts.filter((p: any) => settings.postIds.includes(p.id));
      }
      
      setBlogPosts(posts);
    } catch (error) {
      console.error("Failed to fetch blog posts:", error);
    }
  };

  const fetchProductsForSection = async (section: HomepageSection) => {
    try {
      // Handle manual selection
      if (section.settings.selectionMode === "manual" && section.settings.productIds?.length > 0) {
        const params = new URLSearchParams({
          per_page: "100",
          status: "publish",
        });
        const response = await fetch(`/api/products?${params}`);
        const data = await response.json();
        
        // Filter and sort by productIds order
        const productIds = section.settings.productIds as string[];
        const filteredProducts = (data.data || [])
          .filter((p: any) => productIds.includes(p.id))
          .sort((a: any, b: any) => productIds.indexOf(a.id) - productIds.indexOf(b.id));
        
        setCustomProducts((prev) => ({
          ...prev,
          [section.id]: filteredProducts.map((p: any) => transformApiProduct(p)),
        }));
        return;
      }

      // Auto mode with filters
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
      if (section.settings.onSale) {
        params.append("on_sale", "true");
      }
      if (section.settings.orderBy) {
        // Map admin orderBy values to API sort values
        const sortMap: Record<string, string> = {
          createdAt: "newest",
          price: "price-low",
          rating: "popular",
          sales: "popular",
        };
        params.append("sort", sortMap[section.settings.orderBy] || "newest");
      }

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();
      
      setCustomProducts((prev) => ({
        ...prev,
        [section.id]: (data.data || []).map((p: any) => transformApiProduct(p)),
      }));
    } catch (error) {
      console.error("Failed to fetch products for section:", error);
    }
  };

  const transformApiProduct = (p: any): ProductData => {
    const hasSale = p.salePrice && p.salePrice > 0;
    return {
      id: p.id,
      name: p.name,
      slug: p.slug || p.id,
      price: hasSale ? p.salePrice : p.price,
      originalPrice: hasSale ? p.regularPrice : null,
      image: p.images?.[0]?.src || p.images?.[0] || "",
      rating: p.averageRating,
      reviewCount: p.ratingCount,
      brand: p.brand?.name,
      category: p.categories?.[0]?.name,
      categoryId: p.categories?.[0]?.id,
    };
  };

  const renderSection = (section: HomepageSection) => {
    if (!section.enabled) return null;

    switch (section.id) {
      case "hero":
        return (
          <HeaderWithHero 
            key={section.id} 
            initialBanners={initialBanners}
            initialCategories={initialBannerCategories}
          />
        );
      
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
      
      case "new-products": {
        // Use custom products if category is set or manual selection
        const newProducts = customProducts["new-products"] || initialProducts.new;
        const viewAllLink = section.settings.category 
          ? `/category/${section.settings.category}` 
          : "/category/new";
        return (
          <ProductSection
            key={section.id}
            title={t.sections.newArrivals}
            subtitle=""
            products={newProducts.slice(0, section.settings.limit || 8)}
            viewAllLink={viewAllLink}
          />
        );
      }
      
      case "promotions":
        return <PromotionSlider key={section.id} />;
      
      case "reviews":
        return <ReviewSection key={section.id} />;
      
      case "books": {
        const booksProducts = customProducts["books"] || initialProducts.books;
        const booksViewAllLink = section.settings.category 
          ? `/category/${section.settings.category}` 
          : "/category/books";
        return booksProducts.length > 0 ? (
          <ProductSection
            key={section.id}
            title={section.title || t.sections.featured}
            subtitle=""
            products={booksProducts.slice(0, section.settings.limit || 8)}
            viewAllLink={booksViewAllLink}
          />
        ) : null;
      }
      
      case "tickets": {
        const ticketsProducts = customProducts["tickets"] || initialProducts.tickets;
        const ticketsViewAllLink = section.settings.category 
          ? `/category/${section.settings.category}` 
          : "/category/tickets";
        return ticketsProducts.length > 0 ? (
          <ProductSection
            key={section.id}
            title={section.title || t.sections.featured}
            subtitle=""
            products={ticketsProducts.slice(0, section.settings.limit || 8)}
            viewAllLink={ticketsViewAllLink}
          />
        ) : null;
      }
      
      case "coupon-banner":
        return <CouponBanner key={section.id} />;
      
      case "blog":
        return blogPosts.length > 0 ? (
          <BlogSlider key={section.id} posts={blogPosts} title={section.title || "Blog & Tin tức"} />
        ) : null;
      
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
    { id: "blog", type: "blog", title: "Blog & Tin tức", enabled: true, settings: {} },
  ];

  const sectionsToRender = sections.length > 0 ? sections : defaultSections;

  return (
    <>
      {sectionsToRender.map(renderSection)}
      {/* Always show blog at the end if not in sections */}
      {!sectionsToRender.find(s => s.id === "blog") && blogPosts.length > 0 && (
        <BlogSlider posts={blogPosts} title="Blog & Tin tức" />
      )}
    </>
  );
}
