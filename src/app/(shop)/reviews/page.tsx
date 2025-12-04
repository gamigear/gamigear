"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Search,
  Filter,
  ChevronDown,
  Loader2,
  MessageSquare,
  CheckCircle,
  ThumbsUp,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Review {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  rating: number;
  review: string;
  reviewerName: string;
  verified: boolean;
  createdAt: string;
}

interface ReviewStats {
  total: number;
  average: number;
  distribution: { [key: number]: number };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "highest" | "lowest">("newest");
  const [stats, setStats] = useState<ReviewStats>({
    total: 0,
    average: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  useEffect(() => {
    fetchReviews();
  }, [page, ratingFilter, sortBy]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: "12",
        status: "approved",
      });

      const response = await fetch(`/api/reviews?${params}`);
      const data = await response.json();

      const reviewsData = data.data || [];
      setReviews(reviewsData);
      setTotalPages(data.meta?.totalPages || 1);

      // Calculate stats from all reviews
      if (reviewsData.length > 0) {
        const total = data.meta?.total || reviewsData.length;
        const sum = reviewsData.reduce((acc: number, r: Review) => acc + r.rating, 0);
        const average = sum / reviewsData.length;
        
        const distribution: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviewsData.forEach((r: Review) => {
          distribution[r.rating] = (distribution[r.rating] || 0) + 1;
        });

        setStats({ total, average, distribution });
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews
    .filter((review) => {
      if (ratingFilter && review.rating !== ratingFilter) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          review.productName.toLowerCase().includes(search) ||
          review.review.toLowerCase().includes(search) ||
          review.reviewerName.toLowerCase().includes(search)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "lowest") return a.rating - b.rating;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating: number, size: number = 16) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={size}
            className={
              i < rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-12">
        <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4 text-center">
          <MessageSquare size={48} className="mx-auto mb-4 opacity-80" />
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Đánh giá từ khách hàng
          </h1>
          <p className="text-orange-100 max-w-2xl mx-auto">
            Xem những đánh giá chân thực từ khách hàng đã mua sắm tại Gamigear
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1280px] px-5 pc:px-4 py-8">
        {/* Stats Overview */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Average Rating */}
            <div className="text-center md:border-r border-gray-100">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {stats.average.toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(stats.average), 24)}
              </div>
              <p className="text-gray-500">
                Dựa trên {stats.total} đánh giá
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="md:col-span-2">
              <h3 className="font-medium mb-4">Phân bố đánh giá</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats.distribution[rating] || 0;
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <button
                      key={rating}
                      onClick={() => setRatingFilter(ratingFilter === rating ? null : rating)}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                        ratingFilter === rating ? "bg-orange-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <span className="w-8 text-sm font-medium">{rating} ★</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-12 text-sm text-gray-500 text-right">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Tìm kiếm đánh giá..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="newest">Mới nhất</option>
                <option value="highest">Đánh giá cao nhất</option>
                <option value="lowest">Đánh giá thấp nhất</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>

            {/* Clear Filter */}
            {ratingFilter && (
              <button
                onClick={() => setRatingFilter(null)}
                className="px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Chưa có đánh giá nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Link
                    href={`/goods/detail/${review.productId}`}
                    className="flex-shrink-0"
                  >
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                      {review.productImage ? (
                        <Image
                          src={review.productImage}
                          alt={review.productName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <MessageSquare size={24} />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <Link
                          href={`/goods/detail/${review.productId}`}
                          className="font-medium hover:text-orange-600 line-clamp-1"
                        >
                          {review.productName}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(review.rating, 14)}
                          <span className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Review Text */}
                    <p className="text-gray-700 mb-3">{review.review}</p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {review.reviewerName}
                        </span>
                        {review.verified && (
                          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            <CheckCircle size={12} />
                            Đã mua hàng
                          </span>
                        )}
                      </div>
                      <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-600">
                        <ThumbsUp size={14} />
                        Hữu ích
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-lg ${
                    page === pageNum
                      ? "bg-orange-500 text-white"
                      : "border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Bạn đã mua sản phẩm?</h2>
          <p className="text-orange-100 mb-6">
            Chia sẻ trải nghiệm của bạn và giúp đỡ những khách hàng khác
          </p>
          <Link
            href="/mypage/orders"
            className="inline-block px-6 py-3 bg-white text-orange-600 font-medium rounded-lg hover:bg-orange-50 transition-colors"
          >
            Viết đánh giá ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
