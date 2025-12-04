"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, User, Tag, ArrowLeft, Share2 } from "lucide-react";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string | null;
  status: string;
  author: {
    displayName: string;
    avatarUrl: string | null;
  } | null;
  categories: { id: string; name: string; slug: string }[];
  tags: { id: string; name: string; slug: string }[];
  publishedAt: string | null;
  createdAt: string;
}

interface BlogDetailClientProps {
  post: Post;
  relatedPosts: Post[];
}

export default function BlogDetailClient({ post, relatedPosts }: BlogDetailClientProps) {
  const { t, locale } = useShopTranslation();

  const getDateLocale = () => {
    switch (locale) {
      case "ko": return "ko-KR";
      case "vi": return "vi-VN";
      default: return "en-US";
    }
  };

  const getBackText = () => {
    switch (locale) {
      case "ko": return "블로그로 돌아가기";
      case "vi": return "Quay lại Blog";
      default: return "Back to Blog";
    }
  };

  const getHelpfulText = () => {
    switch (locale) {
      case "ko": return "이 글이 도움이 되셨나요?";
      case "vi": return "Bài viết này có hữu ích không?";
      default: return "Was this article helpful?";
    }
  };

  const getShareText = () => {
    switch (locale) {
      case "ko": return "공유하기";
      case "vi": return "Chia sẻ";
      default: return "Share";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4 py-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={18} />
            {getBackText()}
          </Link>

          {/* Categories */}
          {post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/blog?category=${cat.slug}`}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full hover:bg-blue-200"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-gray-500">
            {post.author && (
              <div className="flex items-center gap-2">
                {post.author.avatarUrl ? (
                  <Image
                    src={post.author.avatarUrl}
                    alt={post.author.displayName}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User size={16} className="text-blue-600" />
                  </div>
                )}
                <span>{post.author.displayName}</span>
              </div>
            )}
            <span className="flex items-center gap-1">
              <Calendar size={16} />
              {new Date(post.publishedAt || post.createdAt).toLocaleDateString(getDateLocale(), {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>


      <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Featured Image */}
          {post.featuredImage && (
            <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden mb-8">
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Content */}
          <article className="bg-white rounded-xl p-6 md:p-10 shadow-sm">
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-6 flex items-center gap-3">
              <Tag size={18} className="text-gray-400" />
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Share */}
          <div className="mt-8 pt-8 border-t flex items-center justify-between">
            <span className="text-gray-500">{getHelpfulText()}</span>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Share2 size={18} />
              {getShareText()}
            </button>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-6">{t.blog.relatedPosts}</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-40 bg-gray-100">
                      {relatedPost.featuredImage ? (
                        <Image
                          src={relatedPost.featuredImage}
                          alt={relatedPost.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <span className="text-3xl">📝</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium line-clamp-2 hover:text-blue-600">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(relatedPost.publishedAt || relatedPost.createdAt).toLocaleDateString(getDateLocale())}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
