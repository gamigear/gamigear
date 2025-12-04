"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, SlidersHorizontal, X, Star, ChevronDown } from "lucide-react";
import { formatPriceVND } from "@/lib/utils";

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-[1280px] mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full h-12 pl-12 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Tìm kiếm
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 py-6">
        {/* Results Header */}
        {results && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Kết quả tìm kiếm cho "{initialQuery}"
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {results.meta.total} sản phẩm được tìm thấy
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="pc:hidden flex items-center gap-2 px-4 py-2 border rounded-lg"
              >
                <SlidersHorizontal size={18} />
                Bộ lọc
              </button>
              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  className="appearance-none bg-white border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {results && results.facets.categories.length > 0 && (
            <aside className={`w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden pc:block'}`}>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Danh mục</h3>
                  {selectedCategory && (
                    <button
                      onClick={() => { setSelectedCategory(null); setPage(1); }}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Xóa bộ lọc
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {results.facets.categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.id === selectedCategory ? null : cat.id); setPage(1); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat.id
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "hover:bg-gray-50"
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
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : results && results.data.length > 0 ? (
              <>
                <div className="grid grid-cols-2 pc:grid-cols-4 gap-4">
                  {results.data.map((product) => (
                    <Link
                      key={product.id}
                      href={`/goods/detail/${product.id}`}
                      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                    >
                      <div className="aspect-square relative bg-gray-100">
                        {product.image ? (
                          <Image
                            src={product.image.startsWith('/') ? product.image : product.image}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                            unoptimized={product.image.startsWith('http')}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        {product.onSale && (
                          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                            SALE
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                          {product.name}
                        </h3>
                        {product.ratingCount > 0 && (
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-gray-600">
                              {product.averageRating.toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-400">
                              ({product.ratingCount})
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          {product.onSale && product.salePrice ? (
                            <>
                              <span className="text-red-600 font-semibold">
                                {formatPriceVND(product.salePrice)}
                              </span>
                              <span className="text-gray-400 text-sm line-through">
                                {formatPriceVND(product.price)}
                              </span>
                            </>
                          ) : (
                            <span className="font-semibold">
                              {formatPriceVND(product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {results.meta.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: results.meta.totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-lg ${
                          page === p
                            ? "bg-blue-600 text-white"
                            : "bg-white border hover:bg-gray-50"
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
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Không tìm thấy sản phẩm
                </h2>
                <p className="text-gray-500 mb-6">
                  Không có sản phẩm nào phù hợp với "{initialQuery}"
                </p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Về trang chủ
                </Link>
              </div>
            ) : !initialQuery ? (
              <div className="text-center py-20">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Nhập từ khóa để tìm kiếm
                </h2>
                <p className="text-gray-500">
                  Tìm kiếm sản phẩm theo tên, mô tả hoặc mã SKU
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
