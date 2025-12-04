"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Search, Filter, Check, X, Trash2, Plus, Loader2 } from "lucide-react";
import Card from "@/components/admin/Card";
import StatCard from "@/components/admin/StatCard";
import { useI18n } from "@/lib/i18n";

interface Review {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  review: string;
  verified: boolean;
  status: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
}

interface BulkReviewForm {
  productId: string;
  count: number;
  minRating: number;
  maxRating: number;
  status: string;
}

// Sample reviewer names for bulk generation
const sampleReviewerNames = [
  "김민수", "이영희", "박지훈", "최수진", "정현우",
  "강미영", "조성민", "윤서연", "임재현", "한지원",
  "송민지", "오준혁", "신예진", "황동현", "전소희",
  "권태영", "류지민", "배수현", "홍성준", "문지영",
];

// Sample review templates
const sampleReviewTemplates = [
  "정말 좋은 상품이에요! 배송도 빠르고 품질도 만족스럽습니다.",
  "아이가 너무 좋아해요. 재구매 의사 있습니다!",
  "가격 대비 품질이 훌륭합니다. 추천해요~",
  "선물용으로 구매했는데 반응이 좋았어요.",
  "기대 이상이에요! 다음에도 이용할게요.",
  "배송이 빨라서 좋았어요. 상품도 만족합니다.",
  "포장이 꼼꼼하게 되어 왔어요. 감사합니다!",
  "사진과 동일한 상품이 왔어요. 만족합니다.",
  "가성비 최고! 주변에 추천하고 있어요.",
  "품질이 좋아서 재구매했어요. 역시 믿고 삽니다.",
  "아이 선물로 샀는데 너무 좋아하네요!",
  "빠른 배송 감사합니다. 상품도 좋아요.",
  "친구 추천으로 구매했는데 만족스러워요.",
  "색상이 예쁘고 품질도 좋아요.",
  "가격도 저렴하고 품질도 좋아서 만족해요.",
];

const statusColors: Record<string, string> = {
  approved: "bg-green-100 text-green-700",
  hold: "bg-yellow-100 text-yellow-700",
  spam: "bg-red-100 text-red-700",
  trash: "bg-gray-100 text-gray-700",
};

export default function ReviewsPage() {
  const { t } = useI18n();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    avgRating: "0",
  });

  // Bulk review creation
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [bulkForm, setBulkForm] = useState<BulkReviewForm>({
    productId: "",
    count: 5,
    minRating: 4,
    maxRating: 5,
    status: "approved",
  });
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchProducts();
  }, [statusFilter]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products?per_page=100&status=publish");
      const data = await response.json();
      setProducts(data.data || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await fetch(`/api/reviews?${params}`);
      const data = await response.json();
      setReviews(data.data || []);
      
      // Calculate stats
      const allReviews = data.data || [];
      const approved = allReviews.filter((r: Review) => r.status === "approved").length;
      const pending = allReviews.filter((r: Review) => r.status === "hold").length;
      const avgRating = allReviews.length > 0
        ? (allReviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / allReviews.length).toFixed(1)
        : "0";
      
      setStats({
        total: allReviews.length,
        approved,
        pending,
        avgRating,
      });
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Failed to update review:', error);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm(t.products.deleteConfirm)) return;
    
    try {
      const response = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      approved: t.reviews.approved,
      hold: t.reviews.pendingApproval,
      spam: 'Spam',
      trash: t.common.delete,
    };
    return labels[status] || status;
  };

  // Generate bulk reviews
  const generateBulkReviews = async () => {
    if (!bulkForm.productId) {
      alert(t.reviews.selectProduct);
      return;
    }

    setGenerating(true);
    try {
      const reviewsToCreate = [];
      
      for (let i = 0; i < bulkForm.count; i++) {
        const rating = Math.floor(
          Math.random() * (bulkForm.maxRating - bulkForm.minRating + 1) + bulkForm.minRating
        );
        const reviewerName = sampleReviewerNames[Math.floor(Math.random() * sampleReviewerNames.length)];
        const reviewText = sampleReviewTemplates[Math.floor(Math.random() * sampleReviewTemplates.length)];
        
        reviewsToCreate.push({
          productId: bulkForm.productId,
          rating,
          review: reviewText,
          reviewerName,
          reviewerEmail: `${reviewerName.toLowerCase().replace(/\s/g, '')}${Math.floor(Math.random() * 1000)}@example.com`,
          status: bulkForm.status,
          verified: Math.random() > 0.3, // 70% chance of being verified
        });
      }

      // Create reviews one by one
      let successCount = 0;
      for (const reviewData of reviewsToCreate) {
        try {
          const response = await fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reviewData),
          });
          if (response.ok) {
            successCount++;
          }
        } catch (err) {
          console.error("Failed to create review:", err);
        }
      }

      alert(`${successCount} ${t.reviews.reviewsCreated}`);
      setShowBulkModal(false);
      setBulkForm({
        productId: "",
        count: 5,
        minRating: 4,
        maxRating: 5,
        status: "approved",
      });
      fetchReviews();
    } catch (error) {
      console.error("Failed to generate reviews:", error);
      alert(t.common.noData);
    } finally {
      setGenerating(false);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      review.productName.toLowerCase().includes(search) ||
      review.reviewerName.toLowerCase().includes(search) ||
      review.review.toLowerCase().includes(search)
    );
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.reviews.title}</h1>
        <button
          onClick={() => setShowBulkModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          <Plus size={18} />
          {t.reviews.bulkCreate}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t.products.reviews}
          value={stats.total.toString()}
          icon={<Star size={24} className="text-yellow-600" />}
        />
        <StatCard
          title={t.reviews.approved}
          value={stats.approved.toString()}
          icon={<Check size={24} className="text-green-600" />}
        />
        <StatCard
          title={t.reviews.pendingApproval}
          value={stats.pending.toString()}
          icon={<Star size={24} className="text-yellow-600" />}
        />
        <StatCard
          title={t.reviews.rating}
          value={stats.avgRating}
          icon={<Star size={24} className="text-yellow-600 fill-yellow-600" />}
        />
      </div>

      <Card>
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`${t.reviews.product}, ${t.reviews.author}, ${t.reviews.content}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t.common.all}</option>
              <option value="approved">{t.reviews.approved}</option>
              <option value="hold">{t.reviews.pendingApproval}</option>
              <option value="spam">Spam</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {t.common.noData}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredReviews.map((review) => (
              <div key={review.id} className="p-4 hover:bg-gray-50">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {review.productImage ? (
                      <Image src={review.productImage} alt={review.productName} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Star size={24} />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link href={`/admin/products/${review.productId}`} className="font-medium text-sm truncate hover:text-blue-600">
                          {review.productName}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(review.rating)}
                          <span className="text-xs text-gray-500">{t.reviews.author}: {review.reviewerName}</span>
                          {review.verified && (
                            <span className="text-xs text-green-600 flex items-center gap-0.5">
                              <Check size={12} /> ✓
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[review.status] || 'bg-gray-100'}`}>
                          {getStatusLabel(review.status)}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{review.review}</p>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                      <div className="flex items-center gap-2">
                        {review.status === "hold" && (
                          <>
                            <button
                              onClick={() => updateReviewStatus(review.id, 'approved')}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                            >
                              <Check size={12} /> {t.reviews.approve}
                            </button>
                            <button
                              onClick={() => updateReviewStatus(review.id, 'spam')}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              <X size={12} /> {t.reviews.reject}
                            </button>
                          </>
                        )}
                        {review.status === "approved" && (
                          <button
                            onClick={() => updateReviewStatus(review.id, 'hold')}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                          >
                            <X size={12} /> {t.reviews.pendingApproval}
                          </button>
                        )}
                        <button
                          onClick={() => deleteReview(review.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title={t.common.delete}
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Bulk Review Creation Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{t.reviews.bulkCreate}</h2>
              <button
                onClick={() => setShowBulkModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Product Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">{t.reviews.selectProduct} *</label>
                <select
                  value={bulkForm.productId}
                  onChange={(e) => setBulkForm({ ...bulkForm, productId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- {t.reviews.selectProduct} --</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Review Count */}
              <div>
                <label className="block text-sm font-medium mb-2">{t.reviews.reviewCount}</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={bulkForm.count}
                  onChange={(e) => setBulkForm({ ...bulkForm, count: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">{t.reviews.maxReviews}</p>
              </div>

              {/* Rating Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.reviews.minRating}</label>
                  <select
                    value={bulkForm.minRating}
                    onChange={(e) => setBulkForm({ ...bulkForm, minRating: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t.reviews.maxRating}</label>
                  <select
                    value={bulkForm.maxRating}
                    onChange={(e) => setBulkForm({ ...bulkForm, maxRating: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-2">{t.reviews.reviewStatus}</label>
                <select
                  value={bulkForm.status}
                  onChange={(e) => setBulkForm({ ...bulkForm, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="approved">{t.reviews.approved}</option>
                  <option value="hold">{t.reviews.pendingApproval}</option>
                </select>
              </div>

              {/* Preview */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>{t.common.preview}:</strong> {bulkForm.count} {t.reviews.previewText} {bulkForm.minRating}~{bulkForm.maxRating}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={generateBulkReviews}
                disabled={generating || !bulkForm.productId}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {t.reviews.generating}
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    {t.reviews.generateReviews}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
