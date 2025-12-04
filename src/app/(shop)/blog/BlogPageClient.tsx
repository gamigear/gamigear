"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, User, Tag, ChevronRight } from "lucide-react";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string | null;
  status: string;
  author: {
    displayName: string;
  } | null;
  categories: { id: string; name: string; slug: string }[];
  tags: { id: string; name: string; slug: string }[];
  publishedAt: string | null;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
}

interface BlogPageClientProps {
  posts: Post[];
  categories: Category[];
  totalPages: number;
  currentPage: number;
  currentCategory?: string;
}

export default function BlogPageClient({
  posts,
  categories,
  totalPages,
  currentPage,
  currentCategory,
}: BlogPageClientProps) {
  const { t, locale } = useShopTranslation();

  const getDateLocale = () => {
    switch (locale) {
      case "ko": return "ko-KR";
      case "vi": return "vi-VN";
      default: return "en-US";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4 py-12">
          <h1 className="text-3xl font-bold text-center">{t.blog.title}</h1>
          <p className="text-gray-500 text-center mt-2">
            {locale === "ko" && "최신 소식과 유용한 정보를 확인하세요"}
            {locale === "en" && "Check out the latest news and useful information"}
            {locale === "vi" && "Xem tin tức mới nhất và thông tin hữu ích"}
          </p>
        </div>
      </div>


      <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {posts.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <p className="text-gray-500">{t.blog.noPostsFound}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Link href={`/blog/${post.slug}`} className="flex flex-col md:flex-row">
                      {/* Image */}
                      <div className="md:w-72 h-48 md:h-auto relative bg-gray-100 flex-shrink-0">
                        {post.featuredImage ? (
                          <Image
                            src={post.featuredImage}
                            alt={post.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <span className="text-4xl">📝</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6">
                        {/* Categories */}
                        {post.categories.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {post.categories.map((cat) => (
                              <span
                                key={cat.id}
                                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                              >
                                {cat.name}
                              </span>
                            ))}
                          </div>
                        )}

                        <h2 className="text-xl font-bold mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                          {post.title}
                        </h2>

                        {post.excerpt && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}

                        {/* Meta */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {post.author && (
                            <span className="flex items-center gap-1">
                              <User size={14} />
                              {post.author.displayName}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(post.publishedAt || post.createdAt).toLocaleDateString(getDateLocale())}
                          </span>
                        </div>

                        {/* Tags */}
                        {post.tags.length > 0 && (
                          <div className="flex items-center gap-2 mt-3">
                            <Tag size={14} className="text-gray-400" />
                            <div className="flex flex-wrap gap-1">
                              {post.tags.slice(0, 3).map((tag) => (
                                <span key={tag.id} className="text-xs text-gray-500">
                                  #{tag.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {currentPage > 1 && (
                  <Link
                    href={`/blog?page=${currentPage - 1}${currentCategory ? `&category=${currentCategory}` : ""}`}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    {t.common.previous}
                  </Link>
                )}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Link
                      key={pageNum}
                      href={`/blog?page=${pageNum}${currentCategory ? `&category=${currentCategory}` : ""}`}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}
                {currentPage < totalPages && (
                  <Link
                    href={`/blog?page=${currentPage + 1}${currentCategory ? `&category=${currentCategory}` : ""}`}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    {t.common.next}
                  </Link>
                )}
              </div>
            )}
          </div>


          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold mb-4">{t.blog.categories}</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/blog"
                    className={`flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 ${
                      !currentCategory ? "bg-blue-50 text-blue-600" : ""
                    }`}
                  >
                    <span>
                      {locale === "ko" && "전체"}
                      {locale === "en" && "All"}
                      {locale === "vi" && "Tất cả"}
                    </span>
                    <ChevronRight size={16} />
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/blog?category=${cat.slug}`}
                      className={`flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 ${
                        currentCategory === cat.slug ? "bg-blue-50 text-blue-600" : ""
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-sm text-gray-400">{cat.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
