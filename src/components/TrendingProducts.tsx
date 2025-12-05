"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import Price from "@/components/Price";

interface Product {
  id: string;
  name: string;
  slug?: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  image: string;
  isNew?: boolean;
  isBest?: boolean;
  freeShipping?: boolean;
}

interface TrendingTab {
  id: string;
  label: string;
  emoji: string;
  enabled: boolean;
  hideOnMobile?: boolean;
  selectionMode: "auto" | "manual";
  autoFilter?: "featured" | "newest" | "on_sale" | "popular" | "category";
  categorySlug?: string;
  productIds?: string[];
  limit?: number;
}

interface TrendingTabsConfig {
  title: string;
  subtitle: string;
  showEmoji: boolean;
  defaultLimit: number;
  tabs: TrendingTab[];
}

interface TrendingProductsProps {
  title?: string;
  limit?: number;
  settings?: {
    selectionMode?: "auto" | "manual";
    productIds?: string[];
    category?: string;
    featured?: boolean;
    onSale?: boolean;
  };
}

const defaultConfig: TrendingTabsConfig = {
  title: "Xem giỏ hàng người khác",
  subtitle: "Sản phẩm được yêu thích nhất",
  showEmoji: true,
  defaultLimit: 16,
  tabs: [
    { id: "best", label: "BEST", emoji: "🥇", enabled: true, selectionMode: "auto", autoFilter: "featured" },
    { id: "hot", label: "Hot Items", emoji: "🔥", enabled: true, selectionMode: "auto", autoFilter: "popular" },
    { id: "new", label: "New Arrivals", emoji: "✨", enabled: true, hideOnMobile: true, selectionMode: "auto", autoFilter: "newest" },
    { id: "sale", label: "On Sale", emoji: "💰", enabled: true, selectionMode: "auto", autoFilter: "on_sale" },
  ],
};

export default function TrendingProducts({ title, limit = 16, settings }: TrendingProductsProps) {
  const [config, setConfig] = useState<TrendingTabsConfig>(defaultConfig);
  const [activeTab, setActiveTab] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [configLoading, setConfigLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);
  const isManualMode = settings?.selectionMode === "manual" && settings?.productIds?.length;

  // Fetch config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/settings/trending-tabs");
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
          // Set first enabled tab as active
          const firstEnabledTab = data.tabs?.find((t: TrendingTab) => t.enabled);
          if (firstEnabledTab) {
            setActiveTab(firstEnabledTab.id);
          }
        }
      } catch (error) {
        console.error("Error fetching trending config:", error);
        setActiveTab(defaultConfig.tabs[0].id);
      } finally {
        setConfigLoading(false);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    if (configLoading || !activeTab) return;
    
    if (isManualMode) {
      fetchManualProducts();
    } else {
      const currentTab = config.tabs.find((t) => t.id === activeTab);
      if (currentTab) {
        fetchProductsForTab(currentTab);
      }
    }
  }, [activeTab, isManualMode, configLoading]);

  const fetchManualProducts = async () => {
    if (!settings?.productIds?.length) return;
    setLoading(true);
    try {
      // Fetch all products and filter by IDs
      const res = await fetch(`/api/products?per_page=100`);
      if (res.ok) {
        const data = await res.json();
        const allProducts = data.data || [];
        const filtered = settings.productIds
          .map((id: string) => allProducts.find((p: any) => p.id === id))
          .filter(Boolean)
          .map((p: any) => {
            const hasSale = p.salePrice && p.salePrice > 0;
            return {
              id: p.id,
              name: p.name,
              brand: typeof p.brand === 'object' ? p.brand?.name : (p.brand || "Gamigear"),
              price: hasSale ? p.salePrice : p.price,
              originalPrice: hasSale ? p.price : null,
              image: p.images?.[0]?.src || p.images?.[0]?.url || p.image || "",
              isNew: p.isNew,
              isBest: p.featured || p.isBest,
              freeShipping: p.freeShipping || p.price > 500000,
            };
          });
        setProducts(filtered);
      }
    } catch (error) {
      console.error("Error fetching manual products:", error);
    } finally {
      setLoading(false);
    }
  };

  const transformProduct = (p: any) => {
    // Only use salePrice if it's greater than 0
    const hasSale = p.salePrice && p.salePrice > 0;
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      brand: typeof p.brand === 'object' ? p.brand?.name : (p.brand || "Gamigear"),
      price: hasSale ? p.salePrice : p.price,
      originalPrice: hasSale ? p.price : null,
      image: p.images?.[0]?.src || p.images?.[0]?.url || p.image || "",
      isNew: p.isNew,
      isBest: p.featured || p.isBest,
      freeShipping: p.freeShipping || p.price > 500000,
    };
  };

  const fetchProductsForTab = async (tab: TrendingTab) => {
    setLoading(true);
    const tabLimit = tab.limit || config.defaultLimit || limit;
    
    try {
      // Manual mode for this tab
      if (tab.selectionMode === "manual" && tab.productIds?.length) {
        const res = await fetch(`/api/products?per_page=100`);
        if (res.ok) {
          const data = await res.json();
          const allProducts = data.data || [];
          const filtered = tab.productIds
            .map((id: string) => allProducts.find((p: any) => p.id === id))
            .filter(Boolean)
            .map(transformProduct);
          setProducts(filtered);
        }
        setLoading(false);
        return;
      }

      // Auto mode
      let url = `/api/products?per_page=${tabLimit}`;
      
      switch (tab.autoFilter) {
        case "featured":
          url += "&featured=true";
          break;
        case "newest":
          url += "&sort=newest";
          break;
        case "on_sale":
          url += "&on_sale=true";
          break;
        case "popular":
          url += "&sort=popular";
          break;
        case "category":
          if (tab.categorySlug) url += `&category=${tab.categorySlug}`;
          break;
      }
      
      // Apply settings filters
      if (settings?.category) url += `&category=${settings.category}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        let transformed = (data.data || []).map(transformProduct);
        
        // If featured filter doesn't have enough products, fill with popular products
        if (tab.autoFilter === "featured" && transformed.length < tabLimit) {
          const fillUrl = `/api/products?per_page=${tabLimit}&sort=popular`;
          const fillRes = await fetch(fillUrl);
          if (fillRes.ok) {
            const fillData = await fillRes.json();
            const existingIds = new Set(transformed.map((p: Product) => p.id));
            const additionalProducts = (fillData.data || [])
              .filter((p: any) => !existingIds.has(p.id))
              .slice(0, tabLimit - transformed.length)
              .map(transformProduct);
            transformed = [...transformed, ...additionalProducts];
          }
        }
        
        setProducts(transformed);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // formatPrice removed - using Price component instead

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 8, products.length));
  };

  const enabledTabs = config.tabs.filter((t) => t.enabled);

  if (configLoading) {
    return (
      <section className="mx-auto w-full max-w-[1280px] px-5 pc:px-4 mb-20 pc:mb-[120px]">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="flex gap-2 mb-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-24 bg-gray-200 rounded-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[1280px] px-5 pc:px-4 mb-20 pc:mb-[120px]">
      {/* Title */}
      <div className="mb-4 pc:mb-9">
        <h2 className="text-xl pc:text-2xl font-bold">
          {title || config.title} 👀
        </h2>
        <p className="text-gray-500 text-sm mt-1">{config.subtitle}</p>
      </div>

      {/* Tabs */}
      <div className="mb-5 -mx-5 pc:mx-0 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-5 pc:px-0 pc:flex-wrap pc:gap-2">
          {enabledTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setVisibleCount(8);
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                tab.hideOnMobile ? "hidden pc:flex" : ""
              } ${
                activeTab === tab.id
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              <span>{tab.label}</span>
              {config.showEmoji && <span className="ml-1">{tab.emoji}</span>}
            </button>
          ))}
        </div>
      </div>


      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 pc:grid-cols-4 gap-4 pc:gap-7">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
              <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-2 pc:grid-cols-4 gap-4 pc:gap-7">
            {products.slice(0, visibleCount).map((product) => (
              <li key={product.id}>
                <Link href={`/goods/detail/${product.slug || product.id}`} className="block group" prefetch={true}>
                  {/* Image */}
                  <div className="relative aspect-square mb-2 pc:mb-4 rounded-lg pc:rounded-xl overflow-hidden bg-gray-100">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-1">
                    {/* Brand */}
                    <p className="text-xs pc:text-sm text-gray-500 line-clamp-1">
                      {product.brand}
                    </p>

                    {/* Name */}
                    <p className="text-sm pc:text-base line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </p>

                    {/* Price */}
                    <div className="flex items-center gap-2 mt-1">
                      <Price amount={product.price} className="text-sm pc:text-base font-bold text-primary" />
                      {product.originalPrice && product.originalPrice > product.price && (
                        <Price amount={product.originalPrice} className="text-xs pc:text-sm text-gray-400 line-through" />
                      )}
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      {product.isNew && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] pc:text-xs font-medium rounded">
                          NEW
                        </span>
                      )}
                      {product.isBest && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] pc:text-xs font-medium rounded">
                          BEST
                        </span>
                      )}
                      {product.freeShipping && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] pc:text-xs font-medium rounded">
                          Free Ship
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Load More Button */}
          {visibleCount < products.length && (
            <div className="flex justify-center mt-7 pc:mt-10">
              <button
                onClick={handleLoadMore}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium hover:border-gray-500 transition-colors w-full pc:w-auto justify-center"
              >
                <span>Xem thêm</span>
                <ChevronDown size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
