"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, SlidersHorizontal, ChevronDown, Grid2X2, LayoutList } from "lucide-react";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  onSale: boolean;
  image: string;
  averageRating: number;
  ratingCount: number;
}

interface Category {
  id: string;
  name: string;
  count: number;
}

interface SearchResult {
  data: Product[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
    query: string;
  };
  facets: {
    categories: Category[];
    priceRange: { min: number; max: number };
  };
}

const sortOptions = [
  { value: "relevance", label: "Liên quan nhất" },
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá thấp đến cao" },
  { value: "price_desc", label: "Giá cao đến thấp" },
  { value: "rating", label: "Đánh giá cao" },
  { value: "popularity", label: "Phổ biến nhất" },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (initialQuery) {
      fetchResults();
    }
  }, [initialQuery, sortBy, selectedCategory, page]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("q", initialQuery);
      params.set("sort", sortBy);
      params.set("page", page.toString());
      if (selectedCategory) params.set("category", selectedCategory);

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  // Transform search results to ProductCard format
  const transformedProducts = results?.data.map((product) => {
    const hasSale = product.onSale && product.salePrice && product.salePrice > 0;
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: hasSale ? product.salePrice! : product.price,
      originalPrice: hasSale ? product.price : null,
      image: product.image || "",
      rating: product.averageRating,
      reviewCount: product.ratingCount,
    };
  }) || [];

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden pb-20 pc:pb-10">
      {/* Search Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-[1280px] mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative min-w-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full h-12 pl-12 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 h-12 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex-shrink-0"
            >
              Tìm kiếm
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-5 pc:px-4 py-6">
        {/* Results Header */}
        {results && (
          <div className="mb-6">
            <div className="mb-4">
              <h1 className="text-2xl pc:text-3xl font-bold truncate">
                Kết quả tìm kiếm cho "{initialQuery.length > 50 ? initialQuery.slice(0, 50) + "..." : initialQuery}"
              </h1>
              <p className="text-gray-400 mt-2">{results.meta.total} sản phẩm</p>
            </div>

            {/* Filters Bar - giống category page */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-full text-sm hover:border-primary hover:text-primary transition-colors"
                >
                  <SlidersHorizontal size={14} />
                  Bộ lọc
                </button>
                <span className="text-sm text-gray-500 pc:hidden">{results.meta.total}</span>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setPage(1);
                    }}
                    className="appearance-none pr-6 py-1 text-sm bg-transparent cursor-pointer focus:outline-none"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                  />
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
          </div>
        )}

        <div className="flex gap-6 overflow-hidden">
          {/* Filters Sidebar */}
          {results && results.facets.categories.length > 0 && (
            <aside className={`w-64 flex-shrink-0 ${showFilters ? "block" : "hidden pc:block"}`}>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Danh mục</h3>
                  {selectedCategory && (
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setPage(1);
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      Xóa bộ lọc
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {results.facets.categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id === selectedCategory ? null : cat.id);
                        setPage(1);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-gray-50"
                      }`}
                    >
                      {cat.name}
                      <span className="float-right text-gray-400">({cat.count})</span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          )}

          {/* Results Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : transformedProducts.length > 0 ? (
              <>
                <div
                  className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 pc:grid-cols-4" : "grid-cols-1 pc:grid-cols-2"}`}
                >
                  {transformedProducts.map((product) => (
                    <ProductCard key={product.id} product={product as any} />
                  ))}
                </div>

                {/* Pagination */}
                {results && results.meta.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: Math.min(results.meta.totalPages, 10) }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-lg ${
                          page === p ? "bg-primary text-white" : "bg-white border hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : results ? (
              <div className="text-center py-20">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h2>
                <p className="text-gray-500 mb-6 break-words px-4">
                  Không có sản phẩm nào phù hợp với "{initialQuery.length > 50 ? initialQuery.slice(0, 50) + "..." : initialQuery}"
                </p>
                <Link href="/" className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90">
                  Về trang chủ
                </Link>
              </div>
            ) : !initialQuery ? (
              <div className="text-center py-20">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Nhập từ khóa để tìm kiếm</h2>
                <p className="text-gray-500">Tìm kiếm sản phẩm theo tên, mô tả hoặc mã SKU</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Filter Modal - Mobile */}
      {showFilters && results && results.facets.categories.length > 0 && (
        <div className="pc:hidden fixed inset-0 z-[700]">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[70vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <h3 className="font-bold">Bộ lọc</h3>
              <button onClick={() => setShowFilters(false)} className="text-sm text-gray-500">
                Đóng
              </button>
            </div>
            <div className="p-4">
              <div className="mb-6">
                <h4 className="font-medium mb-3">Danh mục</h4>
                <div className="flex flex-wrap gap-2">
                  {results.facets.categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id === selectedCategory ? null : cat.id);
                        setPage(1);
                        setShowFilters(false);
                      }}
                      className={`px-3 py-2 border rounded-full text-sm ${
                        selectedCategory === cat.id ? "border-primary bg-primary/10 text-primary" : "border-gray-200"
                      }`}
                    >
                      {cat.name} ({cat.count})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
