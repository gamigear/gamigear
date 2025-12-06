"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Search, Filter, Check, X, Trash2, Plus, Loader2, Upload, RefreshCw, FolderOpen } from "lucide-react";
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
  images?: string;
  verified: boolean;
  status: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  count: number;
}

type BulkMode = "product" | "category" | "all";

type ReviewLocale = "vi" | "ko" | "en";

interface BulkReviewForm {
  mode: BulkMode;
  productIds: string[];
  categoryIds: string[];
  count: number;
  minRating: number;
  maxRating: number;
  status: string;
  includeImages: boolean;
  sampleImages: string[];
  locale: ReviewLocale;
}

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [bulkForm, setBulkForm] = useState<BulkReviewForm>({
    mode: "product",
    productIds: [],
    categoryIds: [],
    count: 5,
    minRating: 4,
    maxRating: 5,
    status: "approved",
    includeImages: false,
    sampleImages: [],
    locale: "vi",
  });
  const [generating, setGenerating] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Image preview modal
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [showImagePreview, setShowImagePreview] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchProducts();
    fetchCategories();
  }, [statusFilter]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products?per_page=500&status=publish");
      const data = await response.json();
      setProducts(data.data || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      params.append("per_page", "100");

      const response = await fetch(`/api/reviews?${params}`);
      const data = await response.json();
      setReviews(data.data || []);

      // Calculate stats from all reviews
      const statsRes = await fetch("/api/reviews?per_page=1000");
      const statsData = await statsRes.json();
      const allReviews = statsData.data || [];
      const approved = allReviews.filter((r: Review) => r.status === "approved").length;
      const pending = allReviews.filter((r: Review) => r.status === "hold").length;
      const avgRating =
        allReviews.length > 0
          ? (allReviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / allReviews.length).toFixed(1)
          : "0";

      setStats({
        total: allReviews.length,
        approved,
        pending,
        avgRating,
      });
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error("Failed to update review:", error);
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm(t.products.deleteConfirm)) return;

    try {
      const response = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error("Failed to delete review:", error);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      approved: t.reviews.approved,
      hold: t.reviews.pendingApproval,
      spam: "Spam",
      trash: t.common.delete,
    };
    return labels[status] || status;
  };

  // Handle image upload for sample images
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        }
      }

      setBulkForm((prev) => ({
        ...prev,
        sampleImages: [...prev.sampleImages, ...uploadedUrls],
      }));
    } catch (error) {
      console.error("Failed to upload images:", error);
      alert("Lỗi upload hình ảnh");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeSampleImage = (index: number) => {
    setBulkForm((prev) => ({
      ...prev,
      sampleImages: prev.sampleImages.filter((_, i) => i !== index),
    }));
  };

  // Generate bulk reviews
  const generateBulkReviews = async () => {
    if (bulkForm.mode === "product" && bulkForm.productIds.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm");
      return;
    }
    if (bulkForm.mode === "category" && bulkForm.categoryIds.length === 0) {
      alert("Vui lòng chọn ít nhất một danh mục");
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch("/api/reviews/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bulkForm),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Đã tạo ${data.created} đánh giá cho ${data.productsCount} sản phẩm!`);
        setShowBulkModal(false);
        setBulkForm({
          mode: "product",
          productIds: [],
          categoryIds: [],
          count: 5,
          minRating: 4,
          maxRating: 5,
          status: "approved",
          includeImages: false,
          sampleImages: [],
          locale: "vi",
        });
        fetchReviews();
      } else {
        alert("Lỗi: " + (data.error || "Không thể tạo đánh giá") + (data.details ? `\n${data.details}` : ""));
      }
    } catch (error) {
      console.error("Failed to generate reviews:", error);
      alert("Lỗi tạo đánh giá hàng loạt: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setGenerating(false);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setBulkForm((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId],
    }));
  };

  const toggleCategorySelection = (categoryId: string) => {
    setBulkForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));
  };

  const selectAllProducts = () => {
    setBulkForm((prev) => ({
      ...prev,
      productIds: prev.productIds.length === products.length ? [] : products.map((p) => p.id),
    }));
  };

  const selectAllCategories = () => {
    setBulkForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.length === categories.length ? [] : categories.map((c) => c.id),
    }));
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

  const parseImages = (imagesStr?: string): string[] => {
    if (!imagesStr) return [];
    try {
      return JSON.parse(imagesStr);
    } catch {
      return [];
    }
  };

  const openImagePreview = (images: string[]) => {
    setPreviewImages(images);
    setShowImagePreview(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.reviews.title}</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchReviews}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            <Plus size={18} />
            {t.reviews.bulkCreate}
          </button>
        </div>
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
          <div className="p-8 text-center text-gray-500">{t.common.noData}</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredReviews.map((review) => {
              const reviewImages = parseImages(review.images);
              return (
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
                          <Link
                            href={`/admin/products/${review.productId}`}
                            className="font-medium text-sm truncate hover:text-blue-600"
                          >
                            {review.productName}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            {renderStars(review.rating)}
                            <span className="text-xs text-gray-500">
                              {t.reviews.author}: {review.reviewerName}
                            </span>
                            {review.verified && (
                              <span className="text-xs text-green-600 flex items-center gap-0.5">
                                <Check size={12} /> ✓
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${statusColors[review.status] || "bg-gray-100"}`}>
                            {getStatusLabel(review.status)}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{review.review}</p>

                      {/* Review Images */}
                      {reviewImages.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {reviewImages.slice(0, 4).map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => openImagePreview(reviewImages)}
                              className="relative w-12 h-12 rounded overflow-hidden bg-gray-100 hover:opacity-80"
                            >
                              <Image src={img} alt={`Review image ${idx + 1}`} fill className="object-cover" />
                              {idx === 3 && reviewImages.length > 4 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">
                                  +{reviewImages.length - 4}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                        </span>
                        <div className="flex items-center gap-2">
                          {review.status === "hold" && (
                            <>
                              <button
                                onClick={() => updateReviewStatus(review.id, "approved")}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                              >
                                <Check size={12} /> {t.reviews.approve}
                              </button>
                              <button
                                onClick={() => updateReviewStatus(review.id, "spam")}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                              >
                                <X size={12} /> {t.reviews.reject}
                              </button>
                            </>
                          )}
                          {review.status === "approved" && (
                            <button
                              onClick={() => updateReviewStatus(review.id, "hold")}
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
              );
            })}
          </div>
        )}
      </Card>

      {/* Bulk Review Creation Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Tạo đánh giá hàng loạt</h2>
              <button onClick={() => setShowBulkModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Left Column - Selection */}
                <div className="space-y-4">
                  {/* Mode Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Chế độ tạo đánh giá</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setBulkForm((prev) => ({ ...prev, mode: "product" }))}
                        className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                          bulkForm.mode === "product" ? "bg-blue-50 border-blue-500 text-blue-700" : "hover:bg-gray-50"
                        }`}
                      >
                        Theo sản phẩm
                      </button>
                      <button
                        onClick={() => setBulkForm((prev) => ({ ...prev, mode: "category" }))}
                        className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                          bulkForm.mode === "category" ? "bg-blue-50 border-blue-500 text-blue-700" : "hover:bg-gray-50"
                        }`}
                      >
                        Theo danh mục
                      </button>
                      <button
                        onClick={() => setBulkForm((prev) => ({ ...prev, mode: "all" }))}
                        className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                          bulkForm.mode === "all" ? "bg-blue-50 border-blue-500 text-blue-700" : "hover:bg-gray-50"
                        }`}
                      >
                        Tất cả SP
                      </button>
                    </div>
                  </div>

                  {/* Product Selection */}
                  {bulkForm.mode === "product" && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Chọn sản phẩm ({bulkForm.productIds.length} đã chọn)</label>
                        <button onClick={selectAllProducts} className="text-xs text-blue-600 hover:underline">
                          {bulkForm.productIds.length === products.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                        </button>
                      </div>
                      <div className="border rounded-lg max-h-64 overflow-y-auto">
                        {products.map((product) => (
                          <label
                            key={product.id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          >
                            <input
                              type="checkbox"
                              checked={bulkForm.productIds.includes(product.id)}
                              onChange={() => toggleProductSelection(product.id)}
                              className="rounded"
                            />
                            <span className="text-sm truncate">{product.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category Selection */}
                  {bulkForm.mode === "category" && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Chọn danh mục ({bulkForm.categoryIds.length} đã chọn)</label>
                        <button onClick={selectAllCategories} className="text-xs text-blue-600 hover:underline">
                          {bulkForm.categoryIds.length === categories.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                        </button>
                      </div>
                      <div className="border rounded-lg max-h-64 overflow-y-auto">
                        {categories.map((category) => (
                          <label
                            key={category.id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          >
                            <input
                              type="checkbox"
                              checked={bulkForm.categoryIds.includes(category.id)}
                              onChange={() => toggleCategorySelection(category.id)}
                              className="rounded"
                            />
                            <span className="text-sm flex-1">{category.name}</span>
                            <span className="text-xs text-gray-500">({category.count} SP)</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Products Info */}
                  {bulkForm.mode === "all" && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-700">
                        <FolderOpen size={20} />
                        <span className="font-medium">Tạo đánh giá cho tất cả {products.length} sản phẩm</span>
                      </div>
                      <p className="text-sm text-blue-600 mt-1">
                        Mỗi sản phẩm sẽ được tạo {bulkForm.count} đánh giá ngẫu nhiên
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Column - Settings */}
                <div className="space-y-4">
                  {/* Review Count */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Số đánh giá mỗi sản phẩm</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={bulkForm.count}
                      onChange={(e) => setBulkForm((prev) => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Tối đa 50 đánh giá mỗi sản phẩm</p>
                  </div>

                  {/* Rating Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Điểm tối thiểu</label>
                      <select
                        value={bulkForm.minRating}
                        onChange={(e) => setBulkForm((prev) => ({ ...prev, minRating: parseInt(e.target.value) }))}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {[1, 2, 3, 4, 5].map((r) => (
                          <option key={r} value={r}>
                            {r} ⭐
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Điểm tối đa</label>
                      <select
                        value={bulkForm.maxRating}
                        onChange={(e) => setBulkForm((prev) => ({ ...prev, maxRating: parseInt(e.target.value) }))}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {[1, 2, 3, 4, 5].map((r) => (
                          <option key={r} value={r}>
                            {r} ⭐
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Locale Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Ngôn ngữ đánh giá</label>
                    <div className="flex gap-2">
                      {[
                        { value: "vi", label: "🇻🇳 Tiếng Việt" },
                        { value: "ko", label: "🇰🇷 한국어" },
                        { value: "en", label: "🇺🇸 English" },
                      ].map((loc) => (
                        <button
                          key={loc.value}
                          onClick={() => setBulkForm((prev) => ({ ...prev, locale: loc.value as ReviewLocale }))}
                          className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                            bulkForm.locale === loc.value
                              ? "bg-blue-50 border-blue-500 text-blue-700"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          {loc.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Tên và nội dung đánh giá sẽ theo ngôn ngữ này</p>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Trạng thái đánh giá</label>
                    <select
                      value={bulkForm.status}
                      onChange={(e) => setBulkForm((prev) => ({ ...prev, status: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="approved">Đã duyệt</option>
                      <option value="hold">Chờ duyệt</option>
                    </select>
                  </div>

                  {/* Include Images */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bulkForm.includeImages}
                        onChange={(e) => setBulkForm((prev) => ({ ...prev, includeImages: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm font-medium">Đính kèm hình ảnh ngẫu nhiên</span>
                    </label>
                  </div>

                  {/* Sample Images Upload */}
                  {bulkForm.includeImages && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Hình ảnh mẫu (sẽ được chọn ngẫu nhiên)</label>
                      <div className="border-2 border-dashed rounded-lg p-4">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                          id="sample-images"
                        />
                        <label
                          htmlFor="sample-images"
                          className="flex flex-col items-center justify-center cursor-pointer"
                        >
                          {uploadingImages ? (
                            <Loader2 size={24} className="animate-spin text-gray-400" />
                          ) : (
                            <>
                              <Upload size={24} className="text-gray-400" />
                              <span className="text-sm text-gray-500 mt-1">Click để upload hình ảnh</span>
                            </>
                          )}
                        </label>
                      </div>

                      {/* Preview uploaded images */}
                      {bulkForm.sampleImages.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {bulkForm.sampleImages.map((img, idx) => (
                            <div key={idx} className="relative group">
                              <div className="w-16 h-16 rounded overflow-hidden bg-gray-100">
                                <Image src={img} alt={`Sample ${idx + 1}`} width={64} height={64} className="object-cover w-full h-full" />
                              </div>
                              <button
                                onClick={() => removeSampleImage(idx)}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Preview */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Xem trước:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>
                        • Chế độ:{" "}
                        {bulkForm.mode === "product"
                          ? `${bulkForm.productIds.length} sản phẩm`
                          : bulkForm.mode === "category"
                          ? `${bulkForm.categoryIds.length} danh mục`
                          : `Tất cả ${products.length} sản phẩm`}
                      </li>
                      <li>• Số đánh giá mỗi SP: {bulkForm.count}</li>
                      <li>
                        • Điểm: {bulkForm.minRating} - {bulkForm.maxRating} ⭐
                      </li>
                      <li>• Trạng thái: {bulkForm.status === "approved" ? "Đã duyệt" : "Chờ duyệt"}</li>
                      {bulkForm.includeImages && <li>• Hình ảnh: {bulkForm.sampleImages.length} ảnh mẫu</li>}
                      <li className="font-medium text-blue-600 pt-2">
                        → Tổng cộng:{" "}
                        {bulkForm.mode === "product"
                          ? bulkForm.productIds.length * bulkForm.count
                          : bulkForm.mode === "all"
                          ? products.length * bulkForm.count
                          : "?"}{" "}
                        đánh giá
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={generateBulkReviews}
                disabled={
                  generating ||
                  (bulkForm.mode === "product" && bulkForm.productIds.length === 0) ||
                  (bulkForm.mode === "category" && bulkForm.categoryIds.length === 0)
                }
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Tạo đánh giá
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImagePreview && previewImages.length > 0 && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowImagePreview(false)}>
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setShowImagePreview(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X size={24} />
            </button>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {previewImages.map((img, idx) => (
                <div key={idx} className="flex-shrink-0">
                  <Image
                    src={img}
                    alt={`Preview ${idx + 1}`}
                    width={400}
                    height={400}
                    className="rounded-lg object-contain max-h-[70vh]"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
