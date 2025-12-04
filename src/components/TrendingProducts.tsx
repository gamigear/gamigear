"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import Price from "@/components/Price";

interface Product {
  id: string;
  name: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  image: string;
  isNew?: boolean;
  isBest?: boolean;
  freeShipping?: boolean;
}

interface Tab {
  id: string;
  label: string;
  emoji: string;
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

const defaultTabs: Tab[] = [
  { id: "best", label: "BEST", emoji: "🥇" },
  { id: "hot", label: "Hot Items", emoji: "🔥" },
  { id: "new", label: "New Arrivals", emoji: "✨" },
  { id: "sale", label: "On Sale", emoji: "💰" },
];

export default function TrendingProducts({ title, limit = 16, settings }: TrendingProductsProps) {
  const [activeTab, setActiveTab] = useState("best");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);
  const isManualMode = settings?.selectionMode === "manual" && settings?.productIds?.length;

  useEffect(() => {
    if (isManualMode) {
      fetchManualProducts();
    } else {
      fetchProducts(activeTab);
    }
  }, [activeTab, isManualMode]);

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
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            brand: typeof p.brand === 'object' ? p.brand?.name : (p.brand || "Gamigear"),
            price: p.salePrice || p.price,
            originalPrice: p.salePrice ? p.price : null,
            image: p.images?.[0]?.src || p.images?.[0]?.url || p.image || "",
            isNew: p.isNew,
            isBest: p.featured || p.isBest,
            freeShipping: p.freeShipping || p.price > 500000,
          }));
        setProducts(filtered);
      }
    } catch (error) {
      console.error("Error fetching manual products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (tab: string) => {
    setLoading(true);
    try {
      let url = `/api/products?limit=${limit}`;
      if (tab === "best") url += "&featured=true";
      else if (tab === "new") url += "&isNew=true";
      else if (tab === "sale") url += "&onSale=true";
      else if (tab === "hot") url += "&orderBy=sales";
      
      // Apply settings filters
      if (settings?.category) url += `&category=${settings.category}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const transformed = (data.data || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          brand: typeof p.brand === 'object' ? p.brand?.name : (p.brand || "Gamigear"),
          price: p.salePrice || p.price,
          originalPrice: p.salePrice ? p.price : null,
          image: p.images?.[0]?.src || p.images?.[0]?.url || p.image || "",
          isNew: p.isNew,
          isBest: p.featured || p.isBest,
          freeShipping: p.freeShipping || p.price > 500000,
        }));
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

  return (
    <section className="mx-auto w-full max-w-[1280px] px-5 pc:px-4 mb-20 pc:mb-[120px]">
      {/* Title */}
      <div className="mb-4 pc:mb-9">
        <h2 className="text-xl pc:text-2xl font-bold">
          {title || "Xem giỏ hàng của người khác"} 👀
        </h2>
        <p className="text-gray-500 text-sm mt-1">Sản phẩm được yêu thích nhất</p>
      </div>

      {/* Tabs */}
      <div className="mb-5 -mx-5 pc:mx-0 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-5 pc:px-0 pc:flex-wrap pc:gap-2">
          {defaultTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setVisibleCount(8);
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                tab.id === "new" ? "hidden pc:flex" : ""
              } ${
                activeTab === tab.id
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              <span>{tab.label}</span>
              <span className="ml-1">{tab.emoji}</span>
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
                <Link href={`/goods/detail/${product.id}`} className="block group">
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
