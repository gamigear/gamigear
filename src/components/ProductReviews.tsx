"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, ThumbsUp, ChevronDown, ImageIcon, X } from "lucide-react";
import { useShopTranslation } from "@/lib/i18n/useShopTranslation";

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  review: string;
  images?: string;
  verified: boolean;
  createdAt: string;
}

interface ProductReviewsProps {
  productId: string;
  averageRating?: number;
  reviewCount?: number;
}

const reviewTexts = {
  en: {
    title: "Customer Reviews",
    noReviews: "No reviews yet",
    beFirst: "Be the first to review this product",
    verified: "Verified Purchase",
    helpful: "Helpful",
    showMore: "Show more reviews",
    allRatings: "All ratings",
    stars: "stars",
    photos: "With photos",
  },
  ko: {
    title: "고객 리뷰",
    noReviews: "아직 리뷰가 없습니다",
    beFirst: "첫 번째 리뷰를 작성해 주세요",
    verified: "구매 인증",
    helpful: "도움됨",
    showMore: "더 보기",
    allRatings: "전체 평점",
    stars: "점",
    photos: "사진 리뷰",
  },
  vi: {
    title: "Đánh giá sản phẩm",
    noReviews: "Chưa có đánh giá nào",
    beFirst: "Hãy là người đầu tiên đánh giá sản phẩm này",
    verified: "Đã mua hàng",
    helpful: "Hữu ích",
    showMore: "Xem thêm",
    allRatings: "Tất cả",
    stars: "sao",
    photos: "Có hình ảnh",
  },
};

export default function ProductReviews({ productId, averageRating = 0, reviewCount = 0 }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<number | null>(null);
  const [showPhotosOnly, setShowPhotosOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Use shop translation hook
  const { locale } = useShopTranslation();
  const t = reviewTexts[locale] || reviewTexts.vi;

  useEffect(() => {
    fetchReviews();
  }, [productId, filter, showPhotosOnly]);

  const fetchReviews = async (loadMore = false) => {
    try {
      const currentPage = loadMore ? page + 1 : 1;
      const params = new URLSearchParams({
        productId,
        status: "approved",
        page: currentPage.toString(),
        per_page: "10",
      });

      const response = await fetch(`/api/reviews?${params}`);
      const data = await response.json();
      
      let filteredReviews = data.data || [];
      
      // Filter by rating
      if (filter) {
        filteredReviews = filteredReviews.filter((r: Review) => r.rating === filter);
      }
      
      // Filter by photos
      if (showPhotosOnly) {
        filteredReviews = filteredReviews.filter((r: Review) => {
          if (!r.images) return false;
          try {
            const imgs = JSON.parse(r.images);
            return imgs.length > 0;
          } catch {
            return false;
          }
        });
      }

      if (loadMore) {
        setReviews(prev => [...prev, ...filteredReviews]);
        setPage(currentPage);
      } else {
        setReviews(filteredReviews);
        setPage(1);
      }
      
      setHasMore(filteredReviews.length === 10);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseImages = (imagesStr?: string): string[] => {
    if (!imagesStr) return [];
    try {
      return JSON.parse(imagesStr);
    } catch {
      return [];
    }
  };

  const renderStars = (rating: number, size = 16) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}
        />
      ))}
    </div>
  );

  // Calculate rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
  }));

  if (loading) {
    return (
      <div className="py-10 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto" />
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Summary Section */}
      <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b">
        {/* Average Rating */}
        <div className="text-center md:text-left">
          <div className="text-5xl font-bold text-primary mb-2">{averageRating.toFixed(1)}</div>
          {renderStars(Math.round(averageRating), 20)}
          <p className="text-sm text-gray-500 mt-2">{reviewCount} {t.title.toLowerCase()}</p>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 space-y-2">
          {ratingCounts.map(({ rating, count }) => {
            const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
            return (
              <button
                key={rating}
                onClick={() => setFilter(filter === rating ? null : rating)}
                className={`w-full flex items-center gap-3 p-1 rounded hover:bg-gray-50 transition-colors ${
                  filter === rating ? "bg-primary/5" : ""
                }`}
              >
                <span className="text-sm w-16">{rating} {t.stars}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-10 text-right">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => { setFilter(null); setShowPhotosOnly(false); }}
          className={`px-4 py-2 rounded-full text-sm border transition-colors ${
            !filter && !showPhotosOnly
              ? "bg-primary text-white border-primary"
              : "border-gray-200 hover:border-primary"
          }`}
        >
          {t.allRatings}
        </button>
        {[5, 4, 3, 2, 1].map((rating) => (
          <button
            key={rating}
            onClick={() => { setFilter(rating); setShowPhotosOnly(false); }}
            className={`px-4 py-2 rounded-full text-sm border transition-colors flex items-center gap-1 ${
              filter === rating
                ? "bg-primary text-white border-primary"
                : "border-gray-200 hover:border-primary"
            }`}
          >
            {rating} <Star size={12} className={filter === rating ? "fill-white" : "fill-yellow-400 text-yellow-400"} />
          </button>
        ))}
        <button
          onClick={() => { setShowPhotosOnly(!showPhotosOnly); setFilter(null); }}
          className={`px-4 py-2 rounded-full text-sm border transition-colors flex items-center gap-1 ${
            showPhotosOnly
              ? "bg-primary text-white border-primary"
              : "border-gray-200 hover:border-primary"
          }`}
        >
          <ImageIcon size={14} />
          {t.photos}
        </button>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star size={32} className="text-gray-300" />
          </div>
          <p className="text-gray-500 mb-2">{t.noReviews}</p>
          <p className="text-sm text-gray-400">{t.beFirst}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => {
            const images = parseImages(review.images);
            return (
              <div key={review.id} className="border-b pb-6 last:border-b-0">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{review.reviewerName}</span>
                      {review.verified && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                          ✓ {t.verified}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating, 14)}
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <p className="text-gray-700 mb-3 whitespace-pre-line">{review.review}</p>

                {/* Images */}
                {images.length > 0 && (
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPreviewImage(img)}
                        className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity"
                      >
                        <Image src={img} alt={`Review image ${idx + 1}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors">
                  <ThumbsUp size={14} />
                  {t.helpful}
                </button>
              </div>
            );
          })}

          {/* Load More */}
          {hasMore && (
            <button
              onClick={() => fetchReviews(true)}
              className="w-full py-3 text-sm text-gray-600 hover:text-primary flex items-center justify-center gap-1"
            >
              {t.showMore}
              <ChevronDown size={16} />
            </button>
          )}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300"
            onClick={() => setPreviewImage(null)}
          >
            <X size={24} />
          </button>
          <Image
            src={previewImage}
            alt="Review image preview"
            width={800}
            height={800}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
