"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: string | null;
}

interface BlogSliderProps {
  title?: string;
  posts: BlogPost[];
}

export default function BlogSlider({ title = "Blog & Tin tức", posts }: BlogSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!posts || posts.length === 0) return null;

  return (
    <section className="py-8 bg-gray-50">
      <div className="mx-auto w-full max-w-[1280px] px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{title}</h2>
          <div className="flex items-center gap-2">
            <Link href="/blog" className="text-sm text-primary hover:underline mr-4">
              Xem tất cả
            </Link>
            <button
              onClick={() => scroll("left")}
              className="p-2 rounded-full bg-white shadow hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 rounded-full bg-white shadow hover:bg-gray-100 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Slider */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="flex-shrink-0 w-[280px] md:w-[300px] bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                {post.featuredImage ? (
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <span>No Image</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-medium text-gray-800 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.excerpt}</p>
                )}
                {post.publishedAt && (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar size={12} />
                    <span>{new Date(post.publishedAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
