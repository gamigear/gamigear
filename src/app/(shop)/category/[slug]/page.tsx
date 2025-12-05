"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronDown, Grid2X2, LayoutList, SlidersHorizontal, Grid3X3, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string | null;
  _count?: { products: number };
  children?: Category[];
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface Product {
  id: string;
  name: string;
  slug?: string;
  price: number;
  salePrice?: number | null;
  originalPrice?: number | null;
  image?: string;
  images?: { url: string }[];
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  isBest?: boolean;
}

const texts = {
  en: {
    new: "New Arrivals",
    best: "Best Sellers",
    sale: "On Sale",
    products: "products",
    filter: "Filter",
    popular: "Popular",
    newest: "Newest",
    priceLow: "Price: Low to High",
    priceHigh: "Price: High to Low",
    noProducts: "No products found in this category",
    priceRange: "Price Range",
    all: "All",
    apply: "Apply",
    close: "Close",
    subcategories: "Subcategories",
    home: "Home",
    categories: "Categories",
  },
  ko: {
    new: "신상품",
    best: "베스트",
    sale: "특가",
    products: "개의 상품",
    filter: "필터",
    popular: "인기순",
    newest: "최신순",
    priceLow: "낮은가격순",
    priceHigh: "높은가격순",
    noProducts: "이 카테고리에 상품이 없습니다",
    priceRange: "가격대",
    all: "전체",
    apply: "적용하기",
    close: "닫기",
    subcategories: "하위 카테고리",
    home: "홈",
    categories: "카테고리",
  },
  vi: {
    new: "Hàng mới",
    best: "Bán chạy",
    sale: "Khuyến mãi",
    products: "sản phẩm",
    filter: "Lọc",
    popular: "Phổ biến",
    newest: "Mới nhất",
    priceLow: "Giá thấp đến cao",
    priceHigh: "Giá cao đến thấp",
    noProducts: "Không có sản phẩm trong danh mục này",
    priceRange: "Khoảng giá",
    all: "Tất cả",
    apply: "Áp dụng",
    close: "Đóng",
    subcategories: "Danh mục con",
    home: "Trang chủ",
    categories: "Danh mục",
  },
};

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { locale } = useShopTranslation();
  const t = texts[locale];
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilter, setShowFilter] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Special slugs that are not real categories
  const specialSlugs = ["new", "best", "sale"];
  const isSpecialSlug = specialSlugs.includes(params.slug);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Only fetch category info for real categories
        if (!isSpecialSlug) {
          const catRes = await fetch(`/api/categories/${params.slug}`);
          if (catRes.ok) {
            const catData = await catRes.json();
            setCategory(catData.data);
          }
        }

        // Build API URL based on slug type
        let apiUrl = "/api/products?limit=50";
        if (params.slug === "new") {
          // Get newest products (sorted by date)
          apiUrl = "/api/products?limit=50&sort=newest";
        } else if (params.slug === "best") {
          // Get featured/best products
          apiUrl = "/api/products?featured=true&limit=50";
        } else if (params.slug === "sale") {
          // Get products on sale
          apiUrl = "/api/products?on_sale=true&limit=50";
        } else {
          // Regular category
          apiUrl = `/api/products?category=${params.slug}&limit=50`;
        }

        const prodRes = await fetch(apiUrl);
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          // Transform products to match ProductCard interface
          const transformedProducts = (prodData.data || []).map((p: any) => {
            // Only use salePrice if it's greater than 0
            const hasSale = p.salePrice && p.salePrice > 0;
            return {
              id: p.id,
              name: p.name,
              slug: p.slug,
              price: hasSale ? p.salePrice : p.price,
              originalPrice: hasSale ? p.price : null,
              image: p.images?.[0]?.src || p.images?.[0]?.url || p.image || "",
              isNew: p.isNew,
              isBest: p.isBest || p.featured,
              rating: p.averageRating || p.rating,
              reviewCount: p.ratingCount || p.reviewCount,
            };
          });
          setProducts(transformedProducts);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.slug, isSpecialSlug]);

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (a.salePrice || a.price) - (b.salePrice || b.price);
      case "price-high":
        return (b.salePrice || b.price) - (a.salePrice || a.price);
      case "newest":
        return 0;
      default:
        return 0;
    }
  });

  // Get category title
  const getCategoryTitle = () => {
    if (category) return category.name;
    if (params.slug === "new") return t.new;
    if (params.slug === "best") return t.best;
    if (params.slug === "sale") return t.sale;
    return params.slug;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }


  return (
    <div className="pb-20 pc:pb-10">
      {/* Mobile Header */}
      <div className="pc:hidden sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center h-12 px-4">
          <Link href="/categories" className="p-1">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="flex-1 text-center font-bold">{getCategoryTitle()}</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4 py-6">
        {/* Breadcrumb - Desktop */}
        <nav className="hidden pc:flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary">{t.home}</Link>
          <ChevronRight size={14} />
          <Link href="/categories" className="hover:text-primary">{t.categories}</Link>
          {category?.parent && (
            <>
              <ChevronRight size={14} />
              <Link href={`/category/${category.parent.slug}`} className="hover:text-primary">
                {category.parent.name}
              </Link>
            </>
          )}
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">{getCategoryTitle()}</span>
        </nav>

        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-start gap-6">
            {category?.image && (
              <div className="hidden pc:block w-32 h-32 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <h1 className="text-2xl pc:text-3xl font-bold">{getCategoryTitle()}</h1>
              {category?.description && (
                <p className="text-gray-500 mt-2 max-w-2xl">{category.description}</p>
              )}
              <p className="text-gray-400 mt-2">{sortedProducts.length} {t.products}</p>
            </div>
          </div>
        </div>

        {/* Subcategories */}
        {category?.children && category.children.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4">{t.subcategories}</h2>
            <div className="flex flex-wrap gap-3">
              {category.children.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/category/${sub.slug}`}
                  className="px-4 py-2 bg-gray-100 hover:bg-primary hover:text-white rounded-full text-sm font-medium transition-colors"
                >
                  {sub.name}
                  {sub._count?.products !== undefined && (
                    <span className="ml-2 text-gray-400">({sub._count.products})</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Filters Bar */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-full text-sm hover:border-primary hover:text-primary transition-colors"
            >
              <SlidersHorizontal size={14} />
              {t.filter}
            </button>
            <span className="text-sm text-gray-500 pc:hidden">
              {sortedProducts.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pr-6 py-1 text-sm bg-transparent cursor-pointer focus:outline-none"
              >
                <option value="popular">{t.popular}</option>
                <option value="newest">{t.newest}</option>
                <option value="price-low">{t.priceLow}</option>
                <option value="price-high">{t.priceHigh}</option>
              </select>
              <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
            </div>

            {/* View Mode - Desktop */}
            <div className="hidden pc:flex items-center gap-1 border-l border-gray-200 pl-3">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded ${viewMode === "grid" ? "bg-gray-100" : ""}`}
              >
                <Grid2X2 size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded ${viewMode === "list" ? "bg-gray-100" : ""}`}
              >
                <LayoutList size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {sortedProducts.length > 0 ? (
          <div className={`grid gap-4 ${
            viewMode === "grid" 
              ? "grid-cols-2 pc:grid-cols-4" 
              : "grid-cols-1 pc:grid-cols-2"
          }`}>
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Grid3X3 size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400">{t.noProducts}</p>
            <Link href="/categories" className="inline-block mt-4 text-primary hover:underline">
              ← {t.categories}
            </Link>
          </div>
        )}
      </div>


      {/* Filter Modal - Mobile */}
      {showFilter && (
        <div className="pc:hidden fixed inset-0 z-[700]">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilter(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[70vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <h3 className="font-bold">{t.filter}</h3>
              <button onClick={() => setShowFilter(false)} className="text-sm text-gray-500">
                {t.close}
              </button>
            </div>
            <div className="p-4">
              {/* Subcategories in filter */}
              {category?.children && category.children.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium mb-3">{t.subcategories}</h4>
                  <div className="flex flex-wrap gap-2">
                    {category.children.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/category/${sub.slug}`}
                        className="px-3 py-2 border border-gray-200 rounded-full text-sm"
                        onClick={() => setShowFilter(false)}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h4 className="font-medium mb-3">{t.priceRange}</h4>
                <div className="flex flex-wrap gap-2">
                  {[t.all, "~100K", "100K~300K", "300K~500K", "500K~"].map((range) => (
                    <button
                      key={range}
                      className="px-4 py-2 border border-gray-200 rounded-full text-sm hover:border-primary hover:text-primary transition-colors"
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
              <button className="w-full py-3 bg-black text-white font-medium rounded-lg">
                {t.apply}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
