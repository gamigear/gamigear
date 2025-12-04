"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Grid3X3, Search } from "lucide-react";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  _count?: { products: number };
  children?: Category[];
}

const texts = {
  en: {
    title: "All Categories",
    subtitle: "Browse all product categories",
    search: "Search categories...",
    products: "products",
    viewAll: "View all",
    noCategories: "No categories found",
    featured: "Featured Categories",
  },
  ko: {
    title: "전체 카테고리",
    subtitle: "모든 상품 카테고리 둘러보기",
    search: "카테고리 검색...",
    products: "개 상품",
    viewAll: "전체보기",
    noCategories: "카테고리가 없습니다",
    featured: "인기 카테고리",
  },
  vi: {
    title: "Tất cả danh mục",
    subtitle: "Khám phá tất cả danh mục sản phẩm",
    search: "Tìm kiếm danh mục...",
    products: "sản phẩm",
    viewAll: "Xem tất cả",
    noCategories: "Không có danh mục",
    featured: "Danh mục nổi bật",
  },
};

export default function CategoriesPage() {
  const { locale } = useShopTranslation();
  const t = texts[locale];
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setCategories(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Link href="/" className="p-1">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="flex-1 text-center font-bold">{t.title}</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4 py-6">
        {/* Desktop Header */}
        <div className="hidden pc:block mb-8">
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="text-gray-500 mt-2">{t.subtitle}</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Categories Grid */}
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-2 pc:grid-cols-4 gap-4 pc:gap-6">
            {filteredCategories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all"
              >
                {/* Image */}
                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <Grid3X3 size={40} className="text-primary/30" />
                    </div>
                  )}
                  {/* Product count badge */}
                  {category._count?.products !== undefined && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium">
                      {category._count.products} {t.products}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{category.description}</p>
                  )}
                  
                  {/* Subcategories preview */}
                  {category.children && category.children.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {category.children.slice(0, 3).map((sub) => (
                        <span
                          key={sub.id}
                          className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600"
                        >
                          {sub.name}
                        </span>
                      ))}
                      {category.children.length > 3 && (
                        <span className="text-xs px-2 py-1 text-gray-400">
                          +{category.children.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* View link */}
                  <div className="mt-3 flex items-center text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {t.viewAll}
                    <ChevronRight size={16} className="ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Grid3X3 size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400">{t.noCategories}</p>
          </div>
        )}
      </div>
    </div>
  );
}
